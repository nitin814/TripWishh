# TripWish
A review based website where people can submit
travel trips and users can rate and review them .


Authentication is done using passport , passport-local-mongoose.

For uploading images I used Cloudinary.

## Prerequisites
Make sure you have Nodejs Installed on your machine.


You should have the following accounts to gain access to keys, and tokens required for the project:
* Cloudinary
* Mongo-DB Atlas

## Installation
1. Clone this repository to your local machine or download and extract the ZIP file.
2. Navigate to the project directory .
   
    ```
    cd <directed-folder>
    ```
  3.Install the required dependencies by running the following command 
    ```
     npm install
    ``` 
    
  4.Create a .env file to store the required keys for the project

  ```
    cloud_cloudname = [value] ( from cloudinary )
  
    cloud_key = [value] ( from cloudinary )
  
    cloud_secret = [value] ( from cloudinary )
  
    secret = [value] ( for session config )
  
    DB_URL = [value]
  ```
5. Run the program by typing the script on your terminal:
    ```
    node app.js
    ```
