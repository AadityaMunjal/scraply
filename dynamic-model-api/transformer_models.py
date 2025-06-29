import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torch.nn.functional as F
import math
from collections import Counter
import time
from params import LAYERS, LOSSES, OPTIMIZERS


class TransformerModel(nn.Module):
    # embed_dim, heads, hidden_dim
    # get vocab_size & SEQUENCE_LENGTH from data procressing

    # sequential = nn.Sequential(*modules)

    def __init__(self, userlayers, vocab_size, SEQUENCE_LENGTH):
        super(TransformerModel, self).__init__()

        self.decoder_layers = nn.ModuleList()

        # need to parse through user layers first to access embed_dim for other layers
        # ----- user defined decoders ------
        for l in userlayers:
            layer_type = l["kind"]
            if layer_type in LAYERS.keys():  # is a layer
                layer_args = l["args"]
                if layer_type == "Decoder":
                    embed_dim, heads, hidden_dim = layer_args
                    self.embed_dim = (
                        embed_dim  # um this updates everytime because im lazy
                    )
                    decoder_layer = LAYERS[layer_type](embed_dim, heads, hidden_dim)
                    self.decoder_layers.append(decoder_layer)
                else:  # ------------  output layer ---------- ---> assuming that decoders/encoders come first and output layers come last
                    # dropout
                    # linear layer
                    if layer_type == "Output":
                        p = layer_args
                        self.dropout_layer = LAYERS[layer_type](p)
                        self.linear_layer = nn.Linear(
                            embed_dim, vocab_size
                        )  # logits of the next word prediction

        self.pos_encoder = PositionalEncoding(
            max_len=SEQUENCE_LENGTH, d_model=embed_dim
        )
        self.emb = nn.Embedding(
            vocab_size, embed_dim
        )  # OUTPUT: [batch_size, sequence_length, 100]
        # torch.nn.TransformerDecoderLayer(d_model, nhead, dim_feedforward=2048, dropout=0.1, activation=<function relu>, layer_norm_eps=1e-05, batch_first=False, norm_first=False, bias=True, device=None, dtype=None)

    def forward(self, x):
        emb = self.emb(x)  # embedding
        input_mask = self.generate_square_subsequent_mask(x.size(1)).to(
            x.device
        )  # make input mask
        x = self.pos_encoder(emb)
        # decoder initialization time!
        # x = self.decoder_layer(x, memory=x, tgt_mask=input_mask, memory_mask=input_mask)
        for decoder in self.decoder_layers:
            x = decoder(x, memory=x, tgt_mask=input_mask, memory_mask=input_mask)

        x = self.dropout_layer(x)
        out = self.linear_layer(x)

        return out

    @staticmethod
    def generate_square_subsequent_mask(sz):
        mask = (torch.triu(torch.ones(sz, sz)) == 1).transpose(0, 1)
        mask = (
            mask.float()
            .masked_fill(mask == 0, float("-inf"))
            .masked_fill(mask == 1, float(0.0))
        )
        return mask


class PositionalEncoding(nn.Module):
    def __init__(self, max_len, d_model, dropout=0.1):
        """
        :param max_len: Input length sequence.
        :param d_model: Embedding dimension.
        :param dropout: Dropout value (default=0.1)
        """
        super(PositionalEncoding, self).__init__()
        self.dropout = nn.Dropout(p=dropout)
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.register_buffer("pe", pe)

    def forward(self, x):
        x = x + self.pe[:, : x.size(1)]  # first generate positional encodings
        return self.dropout(x)  # do some dropout i guess
        #     input: [sequence length, batch size, embed dim]
        #     output: [sequence length, batch size, embed dim]


class TransformerData(Dataset):
    def __init__(self, inp):
        (
            self.vocab_size,
            self.sequence_length,
            self.word_to_int,
            self.int_to_word,
            self.samples,
        ) = self.txt_dataset(inp)

    def __len__(self):
        return len(self.samples)  # number of samples

    def __getitem__(self, idx):
        sample = self.samples[idx]  # retrieving ith sample
        input_seq = torch.LongTensor(
            [self.word_to_int[word] for word in sample[:-1]]
        )  # input
        target_seq = torch.LongTensor(
            [self.word_to_int[word] for word in sample[1:]]
        )  # target words (slides over by 1 each time)
        # remember --> only one target is being outputted each time!
        return input_seq, target_seq

    @staticmethod
    def txt_dataset(inp):
        if inp == "alice":
            file_path = "datasets/alice_1.txt"
        if inp == "shakespeare":
            file_path = "datasets/shakespeare.txt"

        with open(file_path, "r", encoding="utf-8") as file:
            text = file.read()
        # tokenize the text into words
        words = text.split()
        # count unique words from text
        word_counts = Counter(words)
        # make list of the unique words ---> to create a vocabulary
        vocab = list(word_counts.keys())
        VOCAB_SIZE = len(vocab)
        SEQUENCE_LENGTH = 64
        WORD_TO_INT = {
            word: i for i, word in enumerate(vocab)
        }  # maps each word to a unique integer index
        INT_TO_WORD = {
            i: word for word, i in WORD_TO_INT.items()
        }  # maps each integer to a word
        SAMPLES = [
            words[i : i + SEQUENCE_LENGTH + 1]
            for i in range(len(words) - SEQUENCE_LENGTH)
        ]  # training samples of 64 word length

        return VOCAB_SIZE, SEQUENCE_LENGTH, WORD_TO_INT, INT_TO_WORD, SAMPLES


# MOVES MODEL TO DEVICE
class TransformerTrain:  # input is DATALOADERS
    def __init__(self, model, inp, loss, optimizer, batch_size):
        self.dataset = TransformerData(inp)
        self.dataloader = DataLoader(
            self.dataset,
            batch_size=batch_size,
            shuffle=True,
        )

        self.device = (  # for GPU access --> works with CPU as well
            "cuda"
            if torch.cuda.is_available()
            else "mps"
            if torch.backends.mps.is_available()
            else "cpu"
        )
        print(f"Using {self.device} device")

        # MOVE MODEL TO DEVICE
        self.model = model.to(self.device)

        self.loss_fn = LOSSES[loss]
        self.optimizer = OPTIMIZERS[optimizer["kind"]](
            self.model.parameters(), optimizer["lr"]
        )

        # print(model)

    def train(self, n_epochs):
        size = len(self.dataloader.dataset)

        self.model.train()

        train_loss = []

        for epoch in range(n_epochs):
            running_loss = 0
            for input_seq, target_seq in self.dataloader:
                input_seq, target_seq = (
                    input_seq.to(self.device),
                    target_seq.to(self.device),
                )
                outputs = self.model(input_seq)
                target_seq = target_seq.contiguous().view(-1)
                outputs = outputs.view(-1, self.dataset.vocab_size)

                loss = self.loss_fn(outputs, target_seq.view(-1))

                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()
                running_loss += loss.detach().cpu().numpy()
            epoch_loss = running_loss / len(self.dataloader)
            print(f"Epoch {epoch} loss: {epoch_loss:.3f}")
            train_loss.append(float(epoch_loss))

        print("Done!")
        torch.cuda.empty_cache()
        
        return {"train_loss": train_loss}  # return the training loss for each epoch. this might not work with the new ui
        # POSSIBLE FIX:#train_loss = [{"x": i, "y": v} for i, v in enumerate(train_loss)]

    # FOR LATER WHEN INFERENCE IS DYNAMIC
    # return {"train_loss": train_loss, "state_dict": self.model.state_dict(), "vocab_size": self.dataset.vocab_size, "sequence_length": self.dataset.sequence_length, "int_to_word": self.dataset.int_to_word}
    # returns the model state dict, vocab size, sequence_length, and int_to_word for inference

class Inference:
    def __init__(self, model, word_to_int, int_to_word, sequence_length):
        self.model = model
        self.word_to_int = word_to_int
        self.int_to_word = int_to_word
        self.sequence_length = sequence_length

    def return_int_vector(self, text):
        words = text.split()
        input_seq = torch.LongTensor(
            [self.word_to_int[word] for word in words[-self.sequence_length :]]
        ).unsqueeze(0)
        return input_seq

    def sample_next(self, predictions, temperature=1.0, top_k=None):
        """
        Sample the next token using temperature and top-k sampling.

        :param predictions: Model logits for the next word.
        :param temperature: Controls randomness (higher = more random).
        :param top_k: If set, restricts sampling to top-k most likely words.
        """
        probabilities = F.softmax(predictions[:, -1, :] / temperature, dim=-1).cpu()

        if top_k is not None:
            top_values, top_indices = torch.topk(probabilities, top_k)
            probabilities = top_values / torch.sum(top_values)  # Re-normalize
            next_token = torch.multinomial(probabilities, 1).item()
            next_token = top_indices[next_token].item()
        else:
            next_token = torch.multinomial(probabilities, 1).item()

        return next_token

    def generate_text(self, sentence, generate_length, temperature=1.0, top_k=None):
        self.model.eval()
        sample = sentence
        for _ in range(generate_length):
            int_vector = self.return_int_vector(sample)
            if len(int_vector) >= self.sequence_length - 1:
                break
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            input_tensor = int_vector.to(device)
            with torch.no_grad():
                predictions = self.model(input_tensor)
            next_token = self.sample_next(predictions, temperature, top_k)
            sample += " " + self.int_to_word[next_token]
        # print(sample)
        # print('\n')
        return sample  # return the generated text


# --------------------------- testing transformer training (and inference i guess) (for shakespeare) ----------------------------
if __name__ == "__main__":
    temperature = 0.5
    prompt = "Alice was sad"
    generate_length = 100  # this should be an actual argument in the future

    # example arguments
    embed_dim = 100
    heads = 4
    hidden_dim = 2048
    # example data
    params = {
        "type": "transformer",  # ADDED NEW PARAMETER
        "input": "alice",  # preprocess
        "layers": [
            {"kind": "Decoder", "args": (embed_dim, heads, hidden_dim)},
            {"kind": "Decoder", "args": (embed_dim, heads, hidden_dim)},
            {"kind": "Decoder", "args": (embed_dim, heads, hidden_dim)},
            {"kind": "Decoder", "args": (embed_dim, heads, hidden_dim)},
            {"kind": "Output", "args": 0.3},
        ],
        "loss": "CrossEntropy",
        "optimizer": {"kind": "Adam", "lr": 0.001},
        "epoch": 10,
        "batch_size": 32,
    }

    print("hello whats up shawty")
    if torch.cuda.is_available():
        torch.cuda.empty_cache()  # clear GPU memory

    dataset = TransformerData(params["input"])

    model = TransformerModel(
        params["layers"], dataset.vocab_size, dataset.sequence_length
    )  # model is moved to device in train function

    start = time.time()

    t = TransformerTrain(
        model,
        params["input"],
        params["loss"],
        params["optimizer"],
        params["batch_size"],
    )

    losses = t.train(params["epoch"])
    end = time.time()
    print(f"Time taken to train model: {end - start} seconds")

    print(losses)

    print("Model loaded successfully!")
    torch.save(model.state_dict(), "datasets/model3.pth")
    print("Model saved successfully!")

    word_to_int = dataset.word_to_int
    int_to_word = dataset.int_to_word
    SEQUENCE_LENGTH = dataset.sequence_length

    text_gen = Inference(model, word_to_int, int_to_word, SEQUENCE_LENGTH)
    sample = text_gen.generate_text(
        prompt, generate_length, temperature=temperature, top_k=None
    )
    print(sample)
