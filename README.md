# TronScanner

TronScanner is a web application designed to provide clear and user-friendly insights into USDT operations within the TRC-20 network. With TronScanner, users can effortlessly access a comprehensive view of transactions, visualized through detailed tables, intuitive pie charts, and a dynamic sankey graph, which provides deep insights into the money flows.



## Tech Stack

- **CSS:** Used for designing the app's user interface, ensuring a responsive and visually appealing experience.
- **HTML:** Provides the overall structure of the website, ensuring content is organized and presented effectively.
- **JavaScript:** Powers the analysis and plotting of graphs. The project utilizes [Plotly](https://plotly.com/) for creating interactive visualizations.
- **Go:** Handles backend operations, including API request methods and handlers. The Go implementation ensures efficient data retrieval, processing, and seamless integration with the TRC-20 network.

## Features

- **User-Friendly Interface:** Easily input wallet addresses and retrieve detailed transaction data.
- **Time Frame Selection:** Process data for a specific period and get a table of transactions within that time frame.
- **Visualizations:** Understand absolute and relative volumes of inflow and outflow using intuitive pie charts and a sankey graph.
- **Web-Based:** No installation required. Access the tool directly from your browser.

## Usage

Visit [TronScanner](https://tron-go-acjlbqquoq-uc.a.run.app) to start using the tool. Simply input the wallet address and select the desired time frame to retrieve and visualize the transaction data.

## How to Deploy

Deploying TronScanner is streamlined with Docker and Google Cloud. Follow the steps below to deploy your instance:

1. **Clone the Repository:**  
   Begin by cloning the TronScanner repository to your local machine.

   `git clone https://github.com/orlovt/TronScanner.git`

3. **Build the Docker Image:**  
   Utilize Docker's `buildx` command to build the image for the `linux/amd64` platform. This command also tags the image for Google Cloud's Container Registry.
  
   `docker buildx build --platform linux/amd64 -t gcr.io/tronscanner/tron_go . --load`

5. **Push the Image to Google Cloud's Container Registry:**  
   Once the image is built, push it to the Container Registry.
  
   `docker push gcr.io/yourproject_id/repo_name`

7. **Deploy to Google Cloud Run:**  
   With the image in the Container Registry, deploy TronScanner to Google Cloud Run. This command specifies the platform as managed, sets the region, and allows unauthenticated access.
  
   `gcloud run deploy tron-scanner --image gcr.io/yourproject_id/repo_name --platform managed --region us-central1 --allow-unauthenticated`

9. **Verify Deployment:**  
   After deployment, Google Cloud will provide a URL for your service. Visit this URL to ensure TronScanner is operational and all functionalities are intact.


## License

This project is licensed under the MIT License. The MIT License is a permissive license that is short and to the point. It lets people do anything with your code as long as they provide attribution back to you and don’t hold you liable.



