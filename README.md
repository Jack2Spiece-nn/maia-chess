# Aligning Superhuman AI with Human Behavior: Chess as a Model System

## [website](https://maiachess.com)/[paper](https://arxiv.org/abs/2006.01855)/[code](https://github.com/CSSLab/maia-chess)/[lichess](https://lichess.org/team/maia-bots)

🆕♟️🤖🚀✨ **Maia-2 is now available!** The next generation of human-like chess AI with a unified model that coherently captures human play across skill levels.

- 📄 **Paper@NeurIPS '24**: [Maia-2: A Unified Model for Human-AI Alignment in Chess](https://arxiv.org/abs/2409.20553)
- 💻 **Code**: [Maia-2](https://github.com/CSSLab/maia2)

---

A collection of chess engines that play like humans, from ELO 1100 to 1900.

![The accuracy of the different maias across ELO range](images/all_lineplot.png)

In this repo is our 9 final maia models saved as Leela Chess neural networks, and the code to create more and reproduce our results.

Our [website](https://maiachess.com) has information about the project and team.

You can also play against three of of our models on Lichess:

+ [`maia1`](https://lichess.org/@/maia1) is targeting ELO 1100
+ [`maia5`](https://lichess.org/@/maia5) is targeting ELO 1500
+ [`maia9`](https://lichess.org/@/maia9) is targeting ELO 1900
+ [`MaiaMystery`](https://lichess.org/@/MaiaMystery) is for testing new versions of Maia

We also have a Lichess team, [_maia-bots_](https://lichess.org/team/maia-bots), that we will add more bots to.

## How to Run Maia

The Maias are not a full chess framework chess engines, they are just brains (weights) and require a body to work. So you need to load them with [`lc0`](http://lczero.org) and follow the instructions [_here_](http://lczero.org/play/quickstart). Then unlike most other engines you want to *disable* searching, a nodes limit of 1 is what we use. This looks like `go nodes 1` in UCI. Note also, the models are also stronger than the rating they are trained on since they make the _average_ move of a player at that rating.

The links to download the models directly are:

### Models with Lichess Bots

|Targeted Rating | lichess name | link|
|-----|-----|-----|
|1100|[_maia1_](https://lichess.org/@/maia1)|[`maia-1100.pb.gz`](https://github.com/CSSLab/maia-chess/releases/download/v1.0/maia-1100.pb.gz)|
|1500|[_maia5_](https://lichess.org/@/maia5)|[`maia-1500.pb.gz`](https://github.com/CSSLab/maia-chess/releases/download/v1.0/maia-1500.pb.gz)|
|1900|[_maia9_](https://lichess.org/@/maia9)|[`maia-1900.pb.gz`](https://github.com/CSSLab/maia-chess/releases/download/v1.0/maia-1900.pb.gz)|

The bots on Lichess use opening books that are still in development, since the models play the same move every time.

### Other Models

|Targeted Rating | link|
|-----|-----|
|1200|[`maia-1200.pb.gz`](https://github.com/CSSLab/maia-chess/releases/download/v1.0/maia-1200.pb.gz)|
|1300|[`maia-1300.pb.gz`](https://github.com/CSSLab/maia-chess/releases/download/v1.0/maia-1300.pb.gz)|
|1400|[`maia-1400.pb.gz`](https://github.com/CSSLab/maia-chess/releases/download/v1.0/maia-1400.pb.gz)|
|1600|[`maia-1600.pb.gz`](https://github.com/CSSLab/maia-chess/releases/download/v1.0/maia-1600.pb.gz)|
|1700|[`maia-1700.pb.gz`](https://github.com/CSSLab/maia-chess/releases/download/v1.0/maia-1700.pb.gz)|
|1800|[`maia-1800.pb.gz`](https://github.com/CSSLab/maia-chess/releases/download/v1.0/maia-1800.pb.gz)|

We also have all the models in the [`maia_weights`](https://github.com/CSSLab/maia-chess/tree/master/maia_weights) folder of the repo.

### Example

When running the models on the command line it should look like this:

```
:~/maia-chess$ lc0 --weights=model_files/maia-1100.pb.gz
       _
|   _ | |
|_ |_ |_| v0.26.3 built Dec 18 2020
go nodes 1
Loading weights file from: model_files/maia-1100.pb.gz
Creating backend [cudnn-auto]...
Switching to [cudnn]...
...
info depth 1 seldepth 1 time 831 nodes 1 score cp 6 tbhits 0 pv e2e4
bestmove e2e4
```

`move_prediction/maia_chess_backend` also has the `LeelaEngine` class that uses the config files `move_prediction/model_files/*/config.yaml` to wrap [`python-chess`](https://python-chess.readthedocs.io) and allow the models to be used in Python.

## Datasets

As part of our analysis all the game on Lichess with stockfish analysis were processed into csv files. These can be found [here](http://csslab.cs.toronto.edu/datasets/#maia_kdd)

## Code

### Move Prediction

To create your own maia from a set of chess games in the PGN format:

1. Setup your environment
   1. (optional) Install the `conda` environment, [`maia_env.yml`](maia_env.yml)
   2. Make sure all the required packages are installed from `requirements.txt`
2. Convert the PGN into the training format
   1. Add the [`pgn-extract`](https://www.cs.kent.ac.uk/people/staff/djb/pgn-extract/) tool to your path
   2. Add the [`trainingdata-tool`](https://github.com/DanielUranga/trainingdata-tool) to your path
   3. Run `move_prediction/pgn_to_trainingdata.sh PGN_FILE_PATH OUTPUT_PATH`
   4. Wait a bit as the processing is both IO and CPU intense
   5. The script will create a training and validation set, if you wish to train on the whole set copy the files from `OUTPUT_PATH/validation` to `OUTPUT_PATH/training`
3. Edit `move_prediction/maia_config.yml`
   1. Add  `OUTPUT_PATH/training/*/*` to `input_train`
   2. Add  `OUTPUT_PATH/validation/*/*` to `input_test`
   3. (optional) If you have multiple GPUS change the `gpu` filed to the one you are using
   4. (optional) You can also change all the other training parameters here, like the number of layers
4. Run the training script `move_prediction/train_maia.py PATH_TO_CONFIG`
5. (optional) You can use tensorboard to watch the training progress, the logs are in `runs/CONFIG_BASENAME/`
6. Once complete the final model will be in `models/CONFIG_BASENAME/` directory. It will be the one with the largest number

### Replication

To train the models we present in the paper you need to download the raw files from Lichess then cut them into the training sets and process them into the training data format. This is a similar format to the general training instructions just with our specified data, so you will need to have `trainingdata-tool` and `pgn-extract` on your PATH.

Also note that running the scripts manually line by line might be necessary as they do not have any flow control logic. And that `move_prediction/replication-move_training_set.py` is where the main shuffling and games selection logic is.

1. Download the games from [Lichess](https://database.lichess.org/) between January 2017 and November 2019 to `data/lichess_raw`
2. Run `move_prediction/replication-generate_pgns.sh`
3. Run `move_prediction/replication-make_leela_files.sh`
4. Edit `move_prediction/maia_config.yml` and add the elo you want to train:
   1. input_test : `../data/elo_ranges/${elo}/test`
   2. output_train : `../data/elo_ranges/${elo}/train`
5. Run the training script `move_prediction/train_maia.py PATH_TO_CONFIG`

We also include some other (but not all) config files that we tested. Although, we still recommend using the final config `move_prediction/maia_config.yml`.

If you wish to generate the testing set we used you can download the December 2019 data and run `move_prediction/replication-make_testing_pgns.sh`. The data is also avaible for download as a CSV [here](http://csslab.cs.toronto.edu/data/chess/kdd/maia-chess-testing-set.csv.bz2). The script for running models on the dataset is [`replication-run_model_on_csv.py`](move_prediction/replication-run_model_on_csv.py) and requires the `lc0` binary on the path.

### Blunder Prediction

To train the blunder prediction models follow these instructions:

1. Setup your environment
   1. (optional) Install the `conda` environment, [`maia_env.yml`](maia_env.yml)
2. Make sure all the required packages are installed from `requirements.txt`
3. Run `blunder_prediction/make_csvs.sh`
   1. You will probably need to update the paths, and may want to change the targets or use a for loop
4. Run `blunder_prediction/mmap_csv.py` on all the csv files
5. Select a config from `blunder_prediction/configs` and update the paths
6. Run `blunder_prediction/train_model.py CONFIG_PATH

## Citation

Maia (this repo):
```
@inproceedings{mcilroyyoung2020maia,
  title={Aligning Superhuman AI with Human Behavior: Chess as a Model System},
  author={McIlroy-Young, Reid and  Sen, Siddhartha and Kleinberg, Jon and Anderson, Ashton},
  year={2020},
  booktitle={Proceedings of the 25th ACM SIGKDD international conference on Knowledge discovery and data mining}
}
```
[Maia-2](https://github.com/CSSLab/maia2):
```
@inproceedings{tang2024maia,
       title={Maia-2: A Unified Model for Human-{AI} Alignment in Chess},
       author={Zhenwei Tang and Difan Jiao and Reid McIlroy-Young and Jon Kleinberg and Siddhartha Sen and Ashton Anderson},
       booktitle={The Thirty-eighth Annual Conference on Neural Information Processing Systems},
       year={2024},
       url={https://openreview.net/forum?id=XWlkhRn14K}
}
```

## License

The software is available under the GPL License.

## 🌐 Web Application

In addition to the research models, this repository now includes a complete web application that allows you to play against Maia in your browser.

### ✨ Features
- **Interactive Chess Board**: Drag-and-drop interface with beautiful animations
- **Human-like AI**: Play against Maia at 9 different skill levels (1100-1900)
- **Real-time Game Status**: Live updates on game state and turn management
- **Move History**: Complete move tracking with PGN export
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Glass-morphism design with smooth transitions

### 🚀 Quick Start

**Option 1: Docker Compose (Recommended)**
```bash
# Run both frontend and backend
docker-compose up

# Or run in development mode with hot reload
docker-compose --profile dev up
```

**Option 2: Manual Setup**
```bash
# Terminal 1: Start Backend
cd backend
pip install -r requirements.txt
python app.py

# Terminal 2: Start Frontend  
cd frontend
npm install
npm run dev
```

### 🌍 Access Points

- **Frontend**: http://localhost:3000 (React app)
- **Backend API**: http://localhost:5000 (Flask API)
- **API Health**: http://localhost:5000/ (health check)

### 🚀 One-Click Deployment

With the included `render.yaml` you can deploy **real Maia** to Render's free tier in one click.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Render will spin up **two services**:

1. `maia-chess-backend` – Docker service built from `backend/Dockerfile`
   • Installs the `lc0` engine and loads the proper `maia-<level>.pb.gz` weights.  
   • Exposes `GET /` (health) and `POST /get_move`.
2. `maia-chess-frontend` – Static site (Node build) that serves the compiled React app.

Free-plan resource usage
• Backend: 300 MB image, < 200 MB RAM, cold-start < 3 s  
• Frontend: static assets on CDN  
Both sit comfortably inside Render's 512 MB / 750 h-month limits.

After the build finishes you'll have URLs like

```
https://maia-chess-backend.onrender.com    # API
https://maia-chess-frontend.onrender.com   # Web app
```

The frontend is pre-configured to call the backend via `VITE_API_URL` (set in `render.yaml`).

#### Manual Blueprint deploy steps

1. Fork or push this repo to GitHub.  
2. Click the "Deploy to Render" button above and grant Render access to the repo.  
3. Accept the free plan for both services and hit "Apply".  
4. Wait ~5 min for the first build (TensorFlow & lc0).  
5. Open the frontend URL and start playing!

**Important:**  If you fork under a *private* account you'll have to update the build-time environment variable `VITE_API_URL` under the frontend service to point to your backend URL (Render shows it after the backend is live).

### 🛠️ Web App Structure

```
├── frontend/                 # React web application
│   ├── src/components/      # Chess game components
│   ├── src/hooks/           # Game state management  
│   ├── src/services/        # API communication
│   └── package.json         # Frontend dependencies
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application
│   ├── maia_engine.py      # Chess engine integration
│   └── requirements.txt    # Python dependencies
├── docker-compose.yml      # Multi-service deployment
└── render.yaml            # Cloud deployment config
```

### 🎮 How to Play

1. Open the web application in your browser
2. Click "New Game" and choose your color (white/black)  
3. Select AI difficulty (1100-1900 skill level)
4. Make moves by dragging pieces on the board
5. Watch Maia respond with human-like moves
6. Track your game in the move history panel
7. Export your game as PGN when finished

See the [frontend README](frontend/README.md) for detailed development instructions.

## Contact

Please [open an issue](https://github.com/CSSLab/maia-chess/issues/new) or email [Reid McIlroy-Young](https://reidmcy.com/) to get in touch
