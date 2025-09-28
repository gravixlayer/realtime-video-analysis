
# Real-time Video Analysis

Real-time Video Analysis is an AI-powered web application that lets you stream your webcam and receive live feedback on each frame using advanced language models. No video or analysis data is stored—everything is cleared as soon as you leave or refresh the site.

---

## Getting Started

1. **Clone the repository and install dependencies:**
	```bash
	git clone https://github.com/gravixlayer/realtime-video-analysis
	cd realtime-video-analysis
	pnpm install # or npm install or yarn install
	```
2. **Start the development server:**
	```bash
	pnpm dev # or npm run dev or yarn dev
	```
3. **Open your browser:**
	- Go to [http://localhost:3000](http://localhost:3000)

---

## Usage

1. Click "Start Analysis" to begin streaming your webcam.
2. The app will capture frames every 2 seconds and send them to the AI backend for analysis.
3. View live feedback in the right panel, including detected objects, confidence scores, and descriptions for each frame.
4. Click "Stop" to end the session. All results are cleared when you leave or refresh the page.

---

## Deployment

### Production Deployment

1. Build and start the app:
	```bash
	pnpm build && pnpm start
	# or
	npm run build && npm run start
	# or
	yarn build && yarn start
	```
2. Set any required environment variables in `.env.local`.
	- You must set `GRAVIXLAYER_API_KEY` in your environment.
	- Get your API key from [https://platform.gravixlayer.com](https://platform.gravixlayer.com)

---

## Security & Privacy

- All video frames and analysis data are deleted on page unload.
- No user accounts or tracking by default.
- Camera access is only used locally in your browser.

---

## Contributing

We welcome contributions from the community! If you have suggestions, bug reports, or would like to add features, please open an issue or submit a pull request. For major changes, consider discussing them in an issue first to ensure alignment with the project's direction.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Disclaimer

We do not store or save your video or analysis data. All webcam streams and feedback are cleared as soon as you leave or refresh this site. Your privacy and security are our priority.
