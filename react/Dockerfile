FROM node:alpine
 
WORKDIR /usr/src/app

COPY . .

RUN npm install
 
EXPOSE 5173

# The FROM keyworld is used in a Dockerfile to specify the base image that will be used to build a new Docker image. In this case, we are using the node:alpine image as the base.

# The WORKDIR instruction sets the working directory for any subsequent RUN, CMD, ENTRYPOINT, COPY, and ADD instructions.

# The COPY . . instruction copies all the files from the local computer to the /usr/src/app directory in the Docker image.

# The RUN npm install command installs the required dependencies for the React application.

# The EXPOSE instruction specifies that the containerized application will listen on port 5173 for incoming connections.