# What is it ?
An [Animleon](https://www.animelon.com/) alternative that aims to overcome all animelon's inconvenients

# Why ?
Animelon doesn’t provide all anime by default, and its entries are rarely updated, making it difficult for learners who want to watch modern anime with subtitles. That’s why I decided to create this website—to offer the latest anime with subtitles, along with real-time Japanese subtitle translation, providing a more feature-rich alternative.

# Roadmap
> [!note]
> This project is still in its early stages so a lot of crucial stuff are yet to be implemented for this project to be called a usable alternative
- [x] Search system
- [x] Filtering system 
- [x] Implementing the ability watching
- [ ] Authentication using anilist
- [ ] Defintion on hover functionality
- [ ] ass/vtt support

# Self-Hosting

> [!note]
> This application is still in a very early stage, and it is not advised to use it in a production environmentm, and you are likely to face a ton of bugs

### Clone the Repository
```sh
git clone <repo-url>
cd <repo-directory>
```

### Install Dependencies
Use either `pnpm` or `npm`:
```sh
pnpm i  # or npm i
```

### Run Required Services

#### Using Docker Compose
Run the following command to start the required services:
```sh
docker compose -f docker.yaml up -d
```

#### Running Manually
If you prefer to run the services manually, use the following commands:
```sh
docker run -d \
  --name=consumet-api \
  -p 6969:3000 \
  --restart unless-stopped \
  riimuru/consumet-api

docker run -d \
  --name=m3u8-proxy \
  -p 8080:8080 \
  --restart unless-stopped \
  dovakiin0/m3u8-proxy
```

For more details on hosting the Consumet API on Vercel, refer to its [GitHub repository](https://github.com/consumet/consumet-api).

### Register for Jimaku API
Create an account on [Jimaku.cc](https://jimaku.cc) and generate an API token.

### Configure Environment Variables
Create a `.env` file in the root directory and fill the following:
```.env
NEXT_PUBLIC_CONSUMET_URL=
NEXT_PUBLIC_PROXY_URL=
JIMAKU_KEY=
```
it should look something like this
```.env
NEXT_PUBLIC_CONSUMET_URL=http://localhost:6969
NEXT_PUBLIC_PROXY_URL=http://localhost:8080/m3u8-proxy
JIMAKU_KEY=AAAAAasndaund9uhWIJHUSDAIDJamsdkoanmdIAUN
```

### Start the Application
```sh
pnpm run dev  # or npm run dev
```

# Credit
- [Anilist](https://anilist.co/) -> Used to fetch anime data
- [Consument](https://github.com/consumet/api.consumet.org) -> Used to fetch anime streaming data
- [Jimaku](https://jimaku.cc/) -> Used to fetch japanese subtitles
- [ywyh (Me)](https://github.com/ywyher) – for being goated