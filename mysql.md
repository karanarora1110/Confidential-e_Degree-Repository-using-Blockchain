## Steps to create database tables for smooth functionig of project:-

### My database's username is "root" and password is also "root". Update it as per your settings.

### Execute the following commands on database application's console:-

* Create database blockchain;
* use blockchain;
* create table student(rollNo varchar(100), univName varchar(100), studName varchar(100), fatherName varchar(100), course varchar(100), dateOfAward varchar(100),grade varchar(100));
* create table record(rollno varchar(100), txhash varchar(100));
* create table login(User varchar(100), Pass varchar(100));

### Update login table as per your customization, and make store to store sha-256 cryptographic hash of password in database, and not direct password. For this, add any username and password's SHA-256 cryptographic hash. Now, for login, input original username and  original password, not hashed password.
