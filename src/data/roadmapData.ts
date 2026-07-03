import type { RoadmapPhase } from '../types/roadmap';

export const roadmap: RoadmapPhase[] = [
  {
    id: "p0",
    name: "Phase 0 - Math Base",
    theory: "70% theory / 30% code",
    pyslice: "Python slice: variables, functions, loops, lists, numpy arrays, matplotlib. SKIP: OOP, decorators, async, file handling (later).",
    groups: [
      {
        title: "Linear Algebra",
        items: [
          { id: "0.1", ttl: "Vectors", learn: "Vector = list of numbers = a point/arrow. Add two vectors (elementwise). Scalar multiply. Magnitude = sqrt of sum of squares. Do one by hand.", skip: "Vector spaces, basis proofs, linear independence theory.", search: "vectors intuition linear algebra 3blue1brown" },
          { id: "0.2", ttl: "Dot product", learn: "Multiply elementwise, then sum. a.b = sum of ai*bi. Measures similarity/alignment; =0 means perpendicular. By hand, then np.dot. Returns in attention later.", skip: "Cosine similarity derivation, inner product spaces.", search: "dot product intuition meaning explained" },
          { id: "0.3", ttl: "Matrices", learn: "Matrix = grid of numbers, shape = rows x cols. Matrix-vector multiply by hand: each output = dot product of a matrix row with the vector.", skip: "Determinants, inverse, eigenvalues. Skip fully.", search: "matrix vector multiplication explained" },
          { id: "0.4", ttl: "Matrix-matrix multiply", learn: "(m x n)(n x p) = (m x p). Inner dims must match. Each cell = dot of a row with a column. One 2x2 by hand, verify with @.", skip: "Associativity proofs, block matrices.", search: "matrix multiplication how it works step by step" },
          { id: "0.5", ttl: "Shapes + transpose", learn: ".T flips rows/cols. Why shapes must align to multiply. This is ~80% of your future debugging.", skip: "Rank, null space.", search: "numpy array shapes transpose broadcasting explained" }
        ]
      },
      {
        title: "Calculus",
        items: [
          { id: "0.6", ttl: "Derivative", learn: "Slope = rate of change. Rules: power rule (x^n to n*x^(n-1)), constant, sum. Compute simple ones by hand.", skip: "Limits formalism, product/quotient proofs, trig derivatives.", search: "derivative intuition slope explained visually" },
          { id: "0.7", ttl: "Chain rule", keystone: true, learn: "CRITICAL, this IS backprop. f(g(x))' = f'(g(x))*g'(x). Drill 5 examples. Internalize: multiply local slopes along the chain.", skip: "Limits formalism, product/quotient proofs, trig derivatives.", search: "chain rule explained simply calculus" },
          { id: "0.8", ttl: "Partial derivative", learn: "Derivative w.r.t. one variable, hold the others constant. That's it.", skip: "Total differentials, Jacobians (name only).", search: "partial derivatives explained" },
          { id: "0.9", ttl: "Chain rule (multi)", learn: "Chain rule applied to multiple inputs. (e.g. backpropagation through multiple paths).", skip: "Jacobians, Hessians, second-order methods.", search: "partial derivatives multi variable chain rule" }
        ]
      },
      {
        title: "Probability & Stats",
        items: [
          { id: "0.10", ttl: "Basics", learn: "Probability 0-1. Distribution = how probability spreads over outcomes. Independent events multiply.", skip: "Combinatorics depth, measure theory.", search: "probability basics explained beginners" },
          { id: "0.11", ttl: "Stats", learn: "Mean, variance/std (spread), the Gaussian/normal bell shape (mean + std).", skip: "Hypothesis testing, p-values, confidence intervals.", search: "mean variance standard deviation normal distribution statquest" },
          { id: "0.12", ttl: "Bayes rule", learn: "Conditional P(A|B). Bayes rule P(A|B)=P(B|A)P(A)/P(B). Work one example (medical test) fully.", skip: "Full Bayesian inference, priors/posteriors theory.", search: "bayes theorem explained example" }
        ]
      },
      {
        title: "Optimization",
        items: [
          { id: "0.13", ttl: "Gradient descent", learn: "Start random, compute gradient, step opposite, repeat, reach a minimum. Core of all training.", skip: "Convexity proofs, momentum/Adam math (later).", search: "gradient descent explained visually" },
          { id: "0.14", ttl: "Learning rate", learn: "Step size. Too big = overshoot/diverge; too small = slow. Start 0.01-0.1.", skip: "LR schedules, warmup (Phase 2-3).", search: "learning rate gradient descent explained" }
        ]
      }
    ],
    projects: [
      {
        id: "0.P",
        ttl: "Math-by-code notebook",
        learn: "Prove every Phase-0 concept in numpy. Not an app, a proof-log (~10 cells).",
        search: "numpy basics tutorial for machine learning",
        paper: [
          "a=[1,2,3], b=[4,5,6]: a.b by hand, show each multiply + sum.",
          "2x2 A,B: A.B by hand, all 4 cells, write the grid.",
          "f(x)=x^2: power-rule derivative (2x); numerical (f(x+h)-f(x))/h at x=3, h=0.001; predict both ~6.",
          "Gradient descent on x^2: x=5, lr=0.1, 3 steps x=x-lr*(2x) by hand."
        ],
        build: [
          "np.dot(a,b) equals hand answer.",
          "A @ B equals your grid.",
          "numerical derivative ~6; formula 2*3=6.",
          "grad-descent ~10 lines, print x each step, plot x vs step to 0; first 3 match paper."
        ],
        done: [
          "Every code output equals your hand calc. Mismatch = hunt down paper vs understanding. That hunt IS the learning."
        ]
      }
    ],
    gate: {
      title: "GATE to Phase 1 (minimum viable, don't chase mastery)",
      criteria: [
        { id: "g0a", text: "Multiply two matrices by hand" },
        { id: "g0b", text: "State gradient in one sentence" },
        { id: "g0c", text: "Grad-descent code reaches a minimum" }
      ]
    },
    resources: {
      basic: [
        { name: "3Blue1Brown - Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
        { name: "StatQuest - Statistics Fundamentals", url: "http://youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9" },
        { name: "Corey Schafer - Python OOP series (Python bits)", url: "https://www.youtube.com/playlist?list=PL-osiE80TeTsqhIuOqKhwlXsIBIdSeYtc" },
        { name: "uv - Python Environment & Package Manager", url: "https://flocode.substack.com/p/044-python-environments-again-uv" },
        { name: "marimo - Reactive Python Notebooks", url: "https://github.com/marimo-team/marimo" }
      ],
      intermediate: [
        { name: "MIT 18.06 - Gilbert Strang", url: "https://www.youtube.com/playlist?list=PLE7DDD91010BC51F8" },
        { name: "Probabilistic ML (Ch. 2-4) - Kevin Murphy", url: "https://github.com/probml/pml-book" },
        { name: "Python Data Science Handbook - VanderPlas", url: "http://archive.org/details/python-data-science-handbook.pdf/mode/2up" }
      ],
      advanced: [
        { name: "Mathematics for ML - Deisenroth, Faisal, Ong", url: "https://mml-book.github.io/book/mml-book.pdf" },
        { name: "3Blue1Brown - Essence of Calculus", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr" },
        { name: "Deep Learning Book Ch. 2-4 - Goodfellow", url: "https://github.com/janishar/mit-deep-learning-book-pdf" }
      ],
      optionalProject: "NumPy matrix library with ~15 linear-algebra ops + unit tests."
    }
  },
  {
    id: "p1",
    name: "Phase 1 - Classic ML From Scratch",
    theory: "30% theory / 70% build",
    pyslice: "Python slice add: basic classes, CSV load, train/test split by hand. SKIP: pandas mastery (basic load only), sklearn (banned this phase).",
    groups: [
      {
        title: "Concepts",
        items: [
          { id: "1.1", ttl: "What ML is", learn: "Learn a function from data by adjusting weights to reduce error. Supervised = input to label.", skip: "Unsupervised/RL theory (name only), taxonomy essays.", search: "what is machine learning explained simply" },
          { id: "1.2", ttl: "Features, weights, bias", learn: "Prediction = weighted sum of features + bias. yhat = w.x + b.", skip: "Feature engineering deep-dives.", search: "weights and bias explained machine learning" },
          { id: "1.3", ttl: "Loss (regression)", learn: "MSE = mean of (yhat - y)^2. 'How wrong' as one number.", skip: "MAE/Huber/other losses (MSE enough now).", search: "mean squared error explained" },
          { id: "1.4", ttl: "Gradient of loss", learn: "Derivative of MSE w.r.t. weights tells how to nudge each weight. Derive once for the linear case.", skip: "Matrix-calculus general form.", search: "derivative of mse loss function derivation" },
          { id: "1.5", ttl: "Training loop", learn: "predict, loss, gradient, update (w=w-lr*grad), repeat N epochs. Memorize this skeleton.", skip: "Batching/minibatch theory (full-batch fine now).", search: "machine learning training loop from scratch python" },
          { id: "1.6", ttl: "Sigmoid + log loss", learn: "Sigmoid squashes to 0-1 (probability). sigma(z)=1/(1+e^-z). Log/cross-entropy loss for binary.", skip: "Softmax derivation (Phase 2), multi-class for now.", search: "sigmoid function logistic regression cross entropy explained" },
          { id: "1.7", ttl: "Forward vs backward pass", learn: "Forward = compute prediction. Backward = compute gradients via the chain rule.", skip: "Computational-graph autodiff theory.", search: "forward pass backward pass neural network" },
          { id: "1.8", ttl: "Backprop", keystone: true, learn: "KEYSTONE. Watch 3Blue1Brown ch.3+ch.4 first (~30 min, see Phase resources) for intuition, then chain rule through layers by hand. 2-layer net: gradient at output to hidden to weights. Do the math once on paper.", skip: "General backprop for arbitrary graphs (PyTorch later).", search: "3blue1brown backpropagation calculus deep learning chapter 4" },
          { id: "1.sq_nb", ttl: "Naive Bayes [Optional]", optional: true, learn: "Bayes rule applied to features, 'naive' = assume features independent. Do one tiny text-classification example by hand (spam / not-spam on 3 words). Use it as the cheap baseline: if your LLM classifier can't beat Naive Bayes, something is wrong.", skip: "Don't study the full generative-model theory. Baseline use only.", search: "naive bayes classifier intuition step by step" }
        ]
      }
    ],
    projects: [
      {
        id: "1.P1",
        ttl: "Linear regression, pure numpy",
        learn: "Fit a line by writing loss + gradient + update yourself. No sklearn. Split data and compute MSE/RMSE/R2 on the test set JIT.",
        search: "linear regression from scratch numpy",
        paper: [
          "Model yhat=w.x+b.",
          "MSE=(1/n)sum(yhat-y)^2.",
          "Derive dL/dw=(2/n)sum(yhat-y)*x, dL/db=(2/n)sum(yhat-y), show chain steps.",
          "Update w=w-lr*dL/dw.",
          "3 points, w=0,b=0: one full step by hand, every number.",
          "Split data: write steps to hold out ~20% as a test set before training. Train on the rest."
        ],
        build: [
          "Small CSV (size to price) or synthetic y=2x+noise.",
          "Code predict, MSE, gradients, update loop.",
          "Print loss/100 epochs, must decrease.",
          "Plot points + fitted line.",
          "Evaluate: compute MSE, RMSE, and R-squared on the test set."
        ],
        done: [
          "Loss drops, line fits, epoch-1 grads match hand step, final w,b ~ truth.",
          "You understand: training error looks good even when the model is bad, test error is the truth."
        ]
      },
      {
        id: "1.P2",
        ttl: "Logistic regression, pure numpy",
        learn: "Binary classification from scratch. Add nonlinearity + a new loss. Compute precision, recall, F1, and confusion matrix JIT.",
        search: "logistic regression from scratch numpy",
        paper: [
          "Sigmoid sigma(z)=1/(1+e^-z). sigma(0)=0.5, sigma(2)~0.88, sigma(-2)~0.12 by hand. Sketch S-curve.",
          "Model yhat=sigma(w.x+b)=P(class 1).",
          "Log loss L=-(1/n)sum[y*log(yhat)+(1-y)*log(1-yhat)].",
          "Clean gradient dL/dw=(1/n)sum(yhat-y)*x. Why elegant.",
          "One point by hand: z, yhat, loss.",
          "Build a confusion matrix skeleton by hand once (TP, FP, TN, FN) and define Accuracy, Precision, Recall, F1."
        ],
        build: [
          "2 separable blobs or binary CSV.",
          "Code sigmoid, forward, log loss, gradients, update.",
          "Train, loss decreasing.",
          "yhat>0.5 to class 1, accuracy, plot decision boundary.",
          "Evaluate: compute confusion matrix, accuracy, precision, recall, and F1-score from your code."
        ],
        done: [
          "High accuracy on separable data, loss drops, hand yhat matches code.",
          "You understand the imbalanced data trap: when class is 99% imbalanced, accuracy is a lie; know when to prefer recall vs precision."
        ]
      },
      {
        id: "1.P3",
        ttl: "2-layer neural net, numpy only",
        keystone: true,
        learn: "KEYSTONE, make-or-break. Sequence if 1.8 intuition faded: (1) re-watch 3Blue1Brown ch.3+4 (~30 min, Phase resources), (2) do the paper hand-pass below until numbers match, (3) code forward first, print shapes, verify, THEN write backward. If still stuck after that, Karpathy's micrograd video is the deep-dive option (Phase resources) but it's 2.5 hrs, budget it as its own session, don't default to it. Forward + backprop BY HAND in code. Heaviest paper of the roadmap.",
        search: "2 layer neural network from scratch numpy backpropagation",
        paper: [
          "Draw net: 2 in to 3 hidden to 1 out. Label shapes W1(2x3), W2(3x1), biases.",
          "FORWARD: z1=XW1+b1, a1=ReLU(z1), z2=a1W2+b2, yhat=sigma(z2).",
          "BACKWARD layer by layer: dL/dyhat, dyhat/dz2, dz2/dW2 and da1, da1/dz1 (ReLU'), dz1/dW1. Chain to dL/dW2, dL/dW1, db's.",
          "Tiny numbers, 1 sample: ONE full forward+backward by hand, every intermediate value."
        ],
        build: [
          "XOR-like non-linear dataset (1 layer can't solve, proves hidden layer matters).",
          "Forward as paper. Backward as paper chain. Update weights.",
          "Train: loss drops, solves the non-linear task.",
          "Print first-sample intermediates, compare to hand-pass."
        ],
        done: [
          "Solves task a linear model failed.",
          "Loss decreases.",
          "First forward+backward matches paper.",
          "Re-derive backprop on a blank page next day. If not, redo paper. Do NOT proceed without this."
        ]
      },
      {
        id: "1.P4",
        ttl: "End-to-end pipeline",
        learn: "Built after 1.P3. It exists to pull in evaluation, pandas, and plotting at the moment of use, instead of teaching them upfront.",
        search: "machine learning end to end pipeline pandas scikit-learn",
        paper: [
          "Write the pipeline steps (load, clean, split, train, evaluate, interpret) and the single metric you will trust, and why.",
          "Define k-fold cross-validation concept: why a single split can fool you, how k-fold averages that out.",
          "Define Bias-Variance tradeoff as a one-paragraph intuition (underfit = high bias, overfit = high variance)."
        ],
        build: [
          "One notebook. Load a real CSV (learn just-enough pandas here).",
          "Train a model (from scratch or sklearn, your call now that you built the scratch versions).",
          "Evaluate with ROC-AUC + a confusion matrix (learn these here).",
          "Plot the ROC curve with matplotlib.",
          "Implement k-fold cross-validation to evaluate model robustness."
        ],
        done: [
          "You can explain each step and defend the metric choice, no notes.",
          "You can explain why cross-validation prevents single-split bias.",
          "You can define the Bias-Variance tradeoff in plain words."
        ]
      }
    ],
    gate: {
      title: "GATE to Phase 2",
      criteria: [
        { id: "g1a", text: "1.P3 trains, loss drops, solves non-linear task" },
        { id: "g1b", text: "Explain backprop with no notes" },
        { id: "g1c", text: "Explain why each line of your net exists" },
        { id: "g1d", text: "Re-derive backprop on a blank page next day" }
      ]
    },
    resources: {
      basic: [
        { name: "StatQuest - Josh Starmer (ML Playlist)", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF" },
        { name: "CampusX - ML Series in Hinglish", url: "https://www.youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH" },
        { name: "Scikit-Learn User Guide (Scratch to library)", url: "https://scikit-learn.org/stable/user_guide.html" },
        { name: "polars - High-Performance DataFrame Library", url: "https://docs.pola.rs/" },
        { name: "3Blue1Brown - What is backpropagation really doing? (ch.3, ~15 min)", url: "https://www.youtube.com/watch?v=Ilg3gGewQ5U" },
        { name: "3Blue1Brown - Backpropagation calculus (ch.4, ~15 min)", url: "https://www.youtube.com/watch?v=tIeHLnjs5U8" },
        { name: "Karpathy - Micrograd: spelled-out intro to NN and backprop (2.5 hr, deep-dive only)", url: "https://www.youtube.com/watch?v=VMj-3S1tku0" }
      ],
      intermediate: [
        { name: "ISLR - James, Witten, Hastie (Ch. 4-9)", url: "https://www.stat.berkeley.edu/~rabbee/s154/ISLR_First_Printing.pdf" },
        { name: "ESL - Hastie, Tibshirani (Ch. 3-5)", url: "https://web.iitd.ac.in/~sumeet/Hastie.pdf" },
        { name: "Hands-On ML - Aurelien Geron (Un-park first!)", url: "http://14.139.161.31/OddSem-0822-1122/Hands-On_Machine_Learning_with_Scikit-Learn-Keras-and-TensorFlow-2nd-Edition-Aurelien-Geron.pdf" },
        { name: "Book: Chip Huyen, 'Designing Machine Learning Systems'", url: "https://cdn.bookey.app/files/pdf/book/en/designing-machine-learning-systems.pdf" }
      ],
      advanced: [
        { name: "ESL Ch. 10 Boosting", url: "https://web.iitd.ac.in/~sumeet/Hastie.pdf" },
        { name: "Understanding ML - Shalev-Shwartz & Ben-David", url: "https://github.com/ec2ainun/books-ML-and-DL/blob/master/understanding-machine-learning-theory-algorithms%20BY%20Shai%20Shalev-Shwartz%20and%20Shai%20Ben-David.pdf" }
      ],
      optionalProject: "Classic ML: Titanic survival predictor comparing a few algorithms with a short analysis report."
    }
  },
  {
    id: "p2",
    name: "Phase 2 - Deep Learning (PyTorch)",
    theory: "15% theory / 85% build",
    pyslice: "Python slice add: PyTorch tensors, .to(device), nn.Module, DataLoader. SKIP: custom CUDA, distributed, mixed precision.",
    groups: [
      {
        title: "Concepts (JIT)",
        items: [
          { id: "2.1", ttl: "Tensors", learn: "Numpy array + autograd + GPU. Create, reshape, index, .to(device).", skip: "Every tensor op (learn ones you use).", search: "pytorch tensors tutorial beginner" },
          { id: "2.2", ttl: "Autograd", learn: "requires_grad, .backward(), .grad. PyTorch does your Phase-1 backprop for you. Connect it to what you built.", skip: "Custom autograd functions.", search: "pytorch autograd explained" },
          { id: "2.3", ttl: "nn.Module + training", learn: "Model class (init layers, forward). Optimizer (Adam). Loop: zero_grad, forward, loss, backward, step.", skip: "Hooks, Lightning, custom optimizers.", search: "pytorch nn.Module training loop tutorial" },
          { id: "2.4", ttl: "Activations", learn: "ReLU (max(0,x)); why nonlinearity lets nets learn complex functions. Sigmoid/softmax for outputs.", skip: "GELU/SiLU nuance (name only).", search: "relu activation function why nonlinearity" },
          { id: "2.5", ttl: "CNN", learn: "Convolution = filter slides over image detecting patterns. Conv, pooling, flatten to linear. Enough to build one.", skip: "Architecture zoo (ResNet/VGG internals), receptive-field math.", search: "convolutional neural network explained visually" },
          { id: "2.6", ttl: "Attention", keystone: true, learn: "Bridge to Phase 3. Q,K,V. score=Q.K^T/sqrt(d), softmax, weighted sum of V. Dot product (0.2) returns.", skip: "Multi-head full math (single-head first), positional encoding (Phase 3).", search: "self attention query key value explained" }
        ]
      }
    ],
    projects: [
      {
        id: "2.P1",
        ttl: "Rebuild 1.P3 in PyTorch",
        learn: "See what autograd does FOR you.",
        search: "pytorch simple neural network tutorial",
        paper: [
          "List what you hand-wrote in 1.P3 that PyTorch hides (backward, gradient formulas).",
          "New loop skeleton: zero_grad, forward, loss, backward, step. No gradient math now."
        ],
        build: [
          "Same dataset as 1.P3.",
          "nn.Linear + ReLU, BCELoss, Adam.",
          "Training loop; .backward() replaces hand gradients.",
          "Same/better result than numpy."
        ],
        done: [
          "Matches 1.P3, and you can point to the line where PyTorch does what you did by hand."
        ]
      },
      {
        id: "2.P2",
        ttl: "CNN on MNIST/CIFAR-10",
        learn: "Build a conv net that classifies images.",
        search: "pytorch cnn mnist tutorial",
        paper: [
          "Dataflow: 28x28x1, conv, pool, conv, pool, flatten, linear, 10.",
          "One 3x3 filter on a patch: one conv output cell by hand.",
          "Why pooling: shrink + keep strongest signal.",
          "Shape after each layer."
        ],
        build: [
          "MNIST via torchvision (start MNIST not CIFAR).",
          "1-2 conv + pool + flatten + linear, CrossEntropyLoss.",
          "Train few epochs, track train+test accuracy.",
          "Plot predictions; inspect a misclassified one."
        ],
        done: [
          "MNIST ~98%+, hand conv cell matches layer, shapes flow clean."
        ]
      },
      {
        id: "2.P3",
        ttl: "Attention block from scratch",
        keystone: true,
        learn: "Single-head scaled dot-product attention. Heart of modern AI.",
        search: "scaled dot product attention from scratch pytorch",
        paper: [
          "Q=XWq, K=XWk, V=XWv, shapes.",
          "scores=Q.K^T/sqrt(d), softmax, output=softmax.V.",
          "2 tokens, d=2, numbers: Q,K,V, scores, /sqrt(2), softmax, weighted sum. Every number.",
          "Which token attended to which, why? Link to 0.2."
        ],
        build: [
          "Q/K/V as linear layers. scores, scale, softmax, weighted sum.",
          "Small fake embedding sequence. Print attention matrix.",
          "Rows sum to 1; 2-token hand calc matches code."
        ],
        done: [
          "Weights sum to 1, hand matches, explain 'each token attends by Q.K similarity' with no notes."
        ]
      }
    ],
    gate: {
      title: "GATE to Phase 3",
      criteria: [
        { id: "g2a", text: "CNN trains + classifies" },
        { id: "g2b", text: "Attention block runs" },
        { id: "g2c", text: "Explain why each layer exists" }
      ]
    },
    resources: {
      basic: [
        { name: "Andrej Karpathy - makemore series (watch makemore only from this playlist)", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ" },
        { name: "3Blue1Brown - Neural Networks series", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi" },
        { name: "fast.ai - Practical Deep Learning Pt. 1", url: "https://course.fast.ai/" }
      ],
      intermediate: [
        { name: "Karpathy - Zero to Hero (full playlist)", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ" },
        { name: "NYU Deep Learning - Yann LeCun (2021)", url: "https://www.youtube.com/playlist?list=PLLHTzKZzVU9e6xUfG10TkTWApKSZCzuBI" },
        { name: "PyTorch Docs - Autograd & nn.Module deep dive", url: "https://docs.pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html" },
        { name: "safetensors - Safe & Fast Weights Saving", url: "https://huggingface.co/docs/diffusers/main/en/using-diffusers/using_safetensors" }
      ],
      advanced: [
        { name: "Deep Learning Book - Goodfellow (Ch. 6-9)", url: "https://github.com/janishar/mit-deep-learning-book-pdf/blob/master/complete-book-pdf/Ian%20Goodfellow%2C%20Yoshua%20Bengio%2C%20Aaron%20Courville%20-%20Deep%20Learning%20(2017%2C%20MIT).pdf" },
        { name: "Lilian Weng's blog (lilianweng.github.io)", url: "https://lilianweng.github.io/" },
        { name: "Micrograd - Karpathy (~130-line source)", url: "https://github.com/karpathy/micrograd" }
      ],
      cv: {
        basic: [
          { name: "Stanford CS231n - Fei-Fei Li (lecture notes)", url: null },
          { name: "d2l.ai - Ch. 6 CNNs", url: null },
          { name: "fast.ai Part 1 Lessons 1-4", url: null }
        ],
        parked: [
          { name: "ResNet, YOLO, ViT, DDPM papers (Parked / off-path)", url: null }
        ]
      },
      optionalProject: "Deep Learning: hand-written digit classifier in pure NumPy (>97% on MNIST)."
    }
  },
  {
    id: "p3",
    name: "Phase 3 - Modern AI (your zone)",
    theory: "10% theory / 90% build",
    pyslice: "Python slice add: requests/API, async basics, env vars/keys, vector DB client, FastAPI. WARNING: this layer changes monthly. Learn stable parts deep (attention, embeddings, retrieval); treat tools as replaceable.",
    groups: [
      {
        title: "Concepts (JIT)",
        items: [
          { id: "3.1", ttl: "Tokenization", learn: "Text to tokens to ids to embeddings. Subword (BPE) at concept level. Tokens are not words.", skip: "Training your own tokenizer, BPE implementation.", search: "llm tokenization bpe explained" },
          { id: "3.2", ttl: "Transformer", learn: "Stack of (attention + feedforward + residual + layernorm). Add positional info. Enough to assemble a mini version.", skip: "Every variant. Know decoder-only = GPT style, move on.", search: "transformer architecture explained" },
          { id: "3.3", ttl: "Pretraining vs finetuning", learn: "Pretrain = predict next token on huge text. Finetune = adapt. LoRA/PEFT (cheap finetune) at name level.", skip: "Pretraining from scratch, RLHF internals (concept only).", search: "pretraining vs fine tuning llm lora explained" },
          { id: "3.4", ttl: "Embeddings", learn: "Text to fixed vector. Similar meaning = close vectors (cosine/dot). Use an embedding API. Powers RAG + search.", skip: "Training gaming models, dimensionality theory.", search: "text embeddings explained vectors" },
          { id: "3.5", ttl: "RAG", learn: "chunk, embed, vector DB, embed query, retrieve top-k, stuff into prompt, answer. Know each step's why.", skip: "Advanced rerankers, hybrid search, graph RAG (later).", search: "retrieval augmented generation rag explained" },
          { id: "3.6", ttl: "Agents", learn: "LLM + loop + tools. Decide action, call tool, feed result back, repeat until done. You built MASS; understand the loop.", skip: "Heavy frameworks until you get the raw loop; multi-agent theory.", search: "llm agent tool calling loop explained" },
          { id: "3.sq_pca", ttl: "Eigenvalues & PCA [Optional]", optional: true, learn: "Eigenvector = a direction a matrix only stretches. Eigenvalue = how much it stretches. Covariance matrix = how features vary together. PCA = find the eigenvectors of the covariance matrix, keep the top k (largest eigenvalues), project your data onto them. 'Variance explained': the top components keep most of the information. Do one 2x2 eigen by hand, then use numpy/sklearn PCA.", skip: "Don't derive SVD, don't prove diagonalization, don't learn kernel PCA or t-SNE/UMAP internals. Names only.", search: "eigenvalues eigenvectors pca visual intuition 3blue1brown" },
          { id: "3.sq_kmeans", ttl: "k-means Clustering [Optional]", optional: true, learn: "The loop: pick k centers, assign each point to nearest center, move each center to its points' mean, repeat until stable. Do 2 iterations by hand on ~6 points. Pick k with the elbow method (plot inertia vs k, find the bend). Use it for real inside the RAG project: cluster chunks, spot near-duplicates.", skip: "Don't learn k-means++ internals, GMMs, or spectral clustering. Not now.", search: "kmeans clustering elbow method intuition statquest" }
        ]
      }
    ],
    projects: [
      {
        id: "3.P1",
        ttl: "Mini char-level transformer",
        learn: "Tiny GPT. Trains on text, generates text. LLMs demystified.",
        search: "build gpt from scratch char level nanogpt",
        paper: [
          "Pipeline: text, chars, ids, embeddings, +positional, transformer block(s), predict next char, sample, append.",
          "Why positional info (attention is order-blind).",
          "Generation loop: context, probs, sample, append."
        ],
        build: [
          "Small public-domain text; char vocab.",
          "Embedding + positional + 1-2 blocks (reuse 2.P3) + head.",
          "Train next-char (cross-entropy), loss drops.",
          "Generate from a seed; gibberish to word-like."
        ],
        done: [
          "Generates source-style text; trace one token start to finish aloud."
        ]
      },
      {
        id: "3.P2",
        ttl: "RAG from scratch (no framework)",
        keystone: true,
        learn: "Raw RAG. Directly upgrades NewCycl work.",
        search: "rag from scratch python no framework",
        paper: [
          "Pipeline: docs, chunk, embed, store, query, embed, similarity top-k, prompt, LLM, answer.",
          "Retrieval: score=cosine/dot vs all chunks, top-k.",
          "3 tiny 2D vectors: rank chunks by dot product vs a query.",
          "Failure modes: bad chunking, wrong k, irrelevant retrieval."
        ],
        build: [
          "A few docs (your notes/PDF text).",
          "Chunk, embed via API, store (vector DB or numpy+cosine).",
          "Query, embed, top-k, prompt, LLM, answer.",
          "In-doc question (right chunk + grounded answer); then out-of-doc, observe."
        ],
        done: [
          "Correct chunk retrieved, grounded answer, hand-ranking matches code. Explain every RAG step."
        ]
      },
      {
        id: "3.P3",
        ttl: "Simple agent (tool-calling loop)",
        learn: "Minimal agent. The loop under MASS, raw.",
        search: "build llm agent tool calling from scratch python",
        paper: [
          "Loop: goal, LLM decides (answer OR tool), run tool, feed back, repeat, final.",
          "1-2 tools with input/output contracts.",
          "Stop condition.",
          "Trace '47*89 then add 100' turn by turn."
        ],
        build: [
          "Tools as plain functions.",
          "LLM outputs structured action or final; parse it.",
          "Loop: parse, execute, append, re-call, until final.",
          "Test a tool task; add a 2nd tool, multi-step."
        ],
        done: [
          "Multi-step task done via tools, paper trace matches loop, explain MASS's loop."
        ]
      }
    ],
    gate: {
      title: "FINAL GATE (done)",
      criteria: [
        { id: "g3a", text: "Mini-transformer generates text" },
        { id: "g3b", text: "Raw RAG works end-to-end" },
        { id: "g3c", text: "Agent loop calls tools, returns an answer" },
        { id: "g3d", text: "Teach all 3 aloud, 5 min each" }
      ]
    },
    resources: {
      basic: [
        { name: "Stanford CS224n - Lectures 1-5 (Manning)", url: "https://www.youtube.com/playlist?list=PLoROMvodv4rOaMFbaqxPDoLWjDaRAdP9D" },
        { name: "Jay Alammar's blog - Visualizing NLP models", url: "https://jalammar.github.io/" },
        { name: "Prompt Engineering Guide - promptingguide.ai", url: "https://www.promptingguide.ai/" },
        { name: "Andrew Ng - ChatGPT Prompt Engineering", url: "https://www.deeplearning.ai/courses/chatgpt-prompt-eng" },
        { name: "tiktoken - Fast BPE Tokenizer", url: "https://www.datacamp.com/tutorial/tiktoken-library-python" }
      ],
      intermediate: [
        { name: "HuggingFace NLP Course - Ch. 1-4", url: "https://huggingface.co/learn/llm-course/en/chapter1/2" },
        { name: "The Illustrated Transformer - Jay Alammar", url: "https://jalammar.github.io/illustrated-transformer/" },
        { name: "LangChain Python Docs + Cookbook", url: "https://docs.langchain.com/oss/python/langchain/overview" },
        { name: "Vector DBs: FAISS, Chroma, Pinecone (docs)", url: "http://designveloper.com/blog/chroma-vs-faiss-vs-pinecone/" },
        { name: "sentence-transformers - Text Embeddings", url: "http://huggingface.co/sentence-transformers" },
        { name: "ragas - Evaluation framework for RAG", url: "https://arxiv.org/abs/2309.15217" }
      ],
      advanced: [
        { name: "Attention Is All You Need - Vaswani et al., 2017", url: "https://www.google.com/search?q=Attention+Is+All+You+Need+Vaswani+2017+paper" },
        { name: "LoRA - Hu et al., 2021 & QLoRA - Dettmers, 2023", url: "https://www.google.com/search?q=LoRA+Hu+2021+QLoRA+Dettmers+2023+paper" },
        { name: "LlamaIndex Docs", url: "https://www.google.com/search?q=LlamaIndex+documentation" },
        { name: "InstructGPT + DPO papers", url: "https://www.google.com/search?q=InstructGPT+DPO+paper" },
        { name: "vLLM - High-Throughput serving engine", url: "https://www.google.com/search?q=vLLM+high+throughput+LLM+serving" },
        { name: "Book: Sebastian Raschka, 'Build a Large Language Model from Scratch'", url: "https://www.google.com/search?q=Sebastian+Raschka+Build+a+Large+Language+Model+from+Scratch+book" }
      ],
      optionalProject: "NLP/LLM: sentiment analyser comparing Naive Bayes vs a neural model."
    }
  }
];
