# Birdr
> A twitter-like social media platform built with Svelte.

## Features
- [x] User authentication
- [x] Posting
- [x] Some user settings
- [ ] Liking
- [x] Commenting
- [x] Following

## Running yourself

1. Clone repo
```bash
git clone https://github.com/Cyteon/birdr
```

2. Install dependencies
```bash
npm i
```

3. Copy `.env.example` to `.env` and fill out the values. I used supabase for S3, so not sure if names of values is the same on aws S3.

4. Run the platform
```bash
npm run dev
```

or

```bash
npm run build
```
```bash
npm run start
```