# CI/CD with GitHub Actions Task

## Modules
-  EC2 Instance
-  NPM Package
-  GitHub Actions

### EC2 Instance
| Plugin | README |
| ------ | ------ |
| Elastic IP |  52.193.181.57  |
| User | ec2-user |

We have installed the GitHub Action Runner on this EC2 instance. NGINX has also been configured to serve the NPM package webpage pulicly over http. 

### NPM Package
A simple node js application served through NGINX. Displays app version and Author name (passed as a secret)
```
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end("This webserver is serving app version "+process.env.APP_VERSION+"\nAuthor: "+process.env.NAME);
});

server.listen(port, hostname, () => {
  console.log(`The server is running on http://${hostname}:${port}/`);
});
```

### GitHub Actions
Consists of the following three stages:
-  Build 
-  Publish to GitHub Package Registry
-  Deploy to EC2 Instance
```
name: Node.js Package

on:
  push:
    branches: [master]

jobs:
  build:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 12
      - run: npm ci
      - run: npm test

  publish-to-github-package-registry:
    needs: build
    runs-on: self-hosted
    permissions:
      packages: write
      contents: read
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 12
          registry-url: https://npm.pkg.github.com/
      - run: npm ci
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.GITHUB_TOKEN}}

  deploy-to-ec2:
    needs: publish-to-github-package-registry
    runs-on: self-hosted
    permissions:
      packages: write
      contents: read
    steps:
      - shell: bash
        run: |
          cp -r /home/ec2-user/actions-runner/_work/github-actions-task/github-actions-task /home/ec2-user/app
          export NAME="${{secrets.NAME}}"
          APP_VERSION=$(cat /home/ec2-user/app/github-actions-task/package.json | grep version| awk '{print $2}' | tr -d '",')
          export APP_VERSION
          pm2 stop all && pm2 start /home/ec2-user/app/github-actions-task/ index.js --watch --update-env

      

```