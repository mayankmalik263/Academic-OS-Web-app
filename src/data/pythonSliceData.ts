import type { RoadmapItem } from '../types/roadmap';

export const pythonSubsteps: Record<string, RoadmapItem[]> = {
  p0: [
    { id: "pyslice_p0_1", ttl: "Python Variables & Loops", learn: "Master basic Python variables, control flows, and loops.", skip: "Classes, decorators, advanced functions.", search: "python variables loops beginners" },
    { id: "pyslice_p0_2", ttl: "Lists & Functions", learn: "Write reusable functions and operate on lists.", skip: "Generators, coroutines.", search: "python list operations and functions" },
    { id: "pyslice_p0_3", ttl: "NumPy Arrays & Shapes", learn: "Initialize numpy arrays, perform elementwise operations, and transpose shapes.", skip: "Matrix inversion math, advanced linear algebra proofs.", search: "numpy array operations shapes tutorial" },
    { id: "pyslice_p0_4", ttl: "Matplotlib Plotting", learn: "Plot simple functions (like x^2) using matplotlib to visualize curves.", skip: "Complex animation libraries, dashboard frameworks.", search: "matplotlib plot function curve python" }
  ],
  p1: [
    { id: "pyslice_p1_1", ttl: "Basic Classes", learn: "Write simple Python classes to wrap your custom ML models.", skip: "Advanced OOP inheritance hierarchies.", search: "python basic classes tutorial" },
    { id: "pyslice_p1_2", ttl: "CSV Load from Scratch", learn: "Open and parse CSV files without using pandas.", skip: "Pandas dataframe optimization.", search: "python read csv file without pandas" },
    { id: "pyslice_p1_3", ttl: "Train/Test Split Code", learn: "Write a function to shuffle and split your data by hand.", skip: "Scikit-learn train_test_split (banned).", search: "shuffle and split dataset train test python scratch" }
  ],
  p2: [
    { id: "pyslice_p2_1", ttl: "PyTorch Tensor Basics", learn: "Master tensor creation, shapes, and GPU transfer.", skip: "Full PyTorch ecosystem, lighting, torchscript.", search: "pytorch tensors shape tutorial" },
    { id: "pyslice_p2_2", ttl: "Autograd Engine", learn: "Understand how PyTorch tracks gradients using backward().", skip: "Writing custom autograd functions from scratch.", search: "pytorch autograd backward explained" },
    { id: "pyslice_p2_3", ttl: "Custom PyTorch Datasets", learn: "Subclass Dataset and DataLoader for batching.", skip: "Prebuilt dataset downloaders.", search: "pytorch custom dataset and dataloader" },
    { id: "pyslice_p2_4", ttl: "Custom Training Loops", learn: "Write the standard zero_grad(), backward(), step() loop.", skip: "PyTorch Lightning, Hugging Face trainers.", search: "pytorch standard training loop boilerplate" }
  ],
  p3: [
    { id: "pyslice_p3_1", ttl: "PyTorch Module Subclasses", learn: "Subclass nn.Module to build neural networks.", skip: "Non-PyTorch deep learning libraries.", search: "pytorch nn module subclass tutorial" },
    { id: "pyslice_p3_2", ttl: "Tokenization Code", learn: "Write a simple character-level or BPE tokenizer.", skip: "Hugging Face prebuilt tokenizer configs.", search: "build simple character tokenizer python" },
    { id: "pyslice_p3_3", ttl: "Multi-Head Attention Hooks", learn: "Implement the scaled dot-product attention formula.", skip: "FlashAttention assembly optimizations.", search: "multi head attention pytorch implementation" },
    { id: "pyslice_p3_4", ttl: "Custom Text Loaders", learn: "Write a loader to feed text corpora into transformers.", skip: "Prepackaged Hugging Face datasets loader.", search: "pytorch dataloader for raw text files" }
  ]
};
