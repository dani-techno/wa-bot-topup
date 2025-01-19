# WA Bot Topup

WA Bot Topup is a WhatsApp bot that allows users to perform automated top-up transactions.

## Prerequisites

Before getting started, ensure that you have the following software installed on your system:

- **Node.js**: Required to run the server application.
- **Yarn**: An alternative package manager for Node.js.
- **Nodemon**: A tool for automatically restarting the application when files change.

## Installation

### 1. Installation on Desktop and VPS

#### Install Node.js
- Download and install Node.js from the official site: [https://nodejs.org/](https://nodejs.org/)
- Once installed, verify the installation by running the following command in your terminal:
  ```bash
  node -v
```

  This should output the version of Node.js installed.

#### Install Yarn
Yarn is an alternative package manager for Node.js. To install it, use the following command:
  ```bash
  npm install --global yarn
  ```
- After installation, verify by running:
  ```bash
  yarn -v
  ```
  This should output the version of Yarn installed.

#### Install Nodemon
Nodemon is used to automatically restart your Node.js application whenever there are file changes.
- Install Nodemon globally by running the following command:
  ```bash
  npm install -g nodemon
  ```
- Verify the installation by running:
  ```bash
  nodemon -v
  ```
  This should output the version of Nodemon installed.

### 2. Installation on Android and iOS

Installing Node.js, Yarn, and Nodemon directly on Android and iOS devices is not officially supported. However, you can use terminal apps like **Termux** on Android or **a-Shell** on iOS to run a Linux-based environment and install these tools.

- **Android**: Use the app [Termux](https://termux.com/).
- **iOS**: Use the app [a-Shell](https://github.com/holzschu/a-Shell).

### 3. Installing the Project

Once the required software is installed, follow these steps to set up the project:

1. Clone the repository:
   ```bash
   git clone https://github.com/dani-techno/wa-bot-topup.git
   ```
2. Navigate to the project directory:
   ```bash
   cd wa-bot-topup
   ```
3. Install the project dependencies using Yarn:
   ```bash
   yarn install
   ```

### 4. Getting an API Key from ForestAPI

The project interacts with [ForestAPI](https://forestapi.web.id) for top-up transactions. ForestAPI does not require an API key, so you can directly access the available endpoints without registering.

- Visit [ForestAPI](https://forestapi.web.id) for more information on how to use their services.

### 5. Running the Project

Once all dependencies are installed, you can run the application using **Npm**. Run the following command in your terminal:
```bash
npm run start
```

### 6. Using Nodemon

Nodemon automatically restarts the application whenever you make changes to the files. Simply run the following command in the project directory:
```bash
nodemon index.js
```

### 7. Reference Links

- Nodemon Documentation: [https://www.npmjs.com/package/nodemon](https://www.npmjs.com/package/nodemon)
- ForestAPI Site: [https://forestapi.web.id](https://forestapi.web.id)
