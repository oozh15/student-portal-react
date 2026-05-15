*Student Portal*

*Features of the Student Portal*

 Maintains a clean separation between the live student table and the registration input form.
 loading overlay to indicate when data is being fetched or saved.
 Integrates Firebase Authentication to manage user sign-up and login securely via the cloud.
 Uses a direct PHP-to-Firebase connection for fast, real-time data synchronization.
 loading screen to handle transitions smoothly while data is being fetched or saved.
 It automatically protects your website from SQL Injection attacks by separating the "query" from the "user data."

*Technology & Tools Stack*

Frontend: React 
Backend: PHP 
Identity: Firebase 
Storage: Firebase Realtime Database


*Step-by-Step:*

Setting up the PHP Server

1. Check if PHP is installed
Open your Command Prompt (CMD) and type:

php -v
If you see a version number (like PHP 8.2), you are ready. If it says "not recognized," you need to download the PHP ZIP from windows.php.net and add the folder to your system Path Environment Variables.

2. Start the Backend Server
Navigate to your backend folder:


cd C:\Users\ELCOT\Downloads\student-app\backend
Start the built-in server on Port 8000:


php -S localhost:8000
Keep this window open! If you close it, your React app won't be able to fetch any data.

3. Start the Frontend
Open a new terminal window.

Navigate to your frontend:

cd C:\Users\ELCOT\Downloads\student-app\frontend
Start React:

npm start
How it works (The flow)
React (at localhost:3000) sends a request to PHP (at localhost:8000).

This lightweight setup proves you can manage a full-stack environment using just the core language engines



Updating your React Config (App.js)
The firebaseConfig is the "ID card" for your project. You must fill it with the keys from your Firebase Console.

Updating your PHP URL (api.php)
If you are using PHP to talk directly to Firebase (instead of a local MySQL database), you use that specific .json endpoint.













