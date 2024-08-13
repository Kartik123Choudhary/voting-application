const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');

//Eastablishing the Connection with the Oracle Database

const dbConfig = {
    user: "system",
    password: "22bce1095",
    connectString: "localhost:1521/XEPDB1"
};



// Function to insert the values inside the User table

async function insertUser(username, age, email, mobile, aadhar, password) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            'INSERT INTO Users (username, age, email, mobile, aadhar, password) VALUES (:username, :age, :email, :mobile, :aadhar, :password)',
            { username, age, email, mobile, aadhar, password }
        );
        await connection.commit();
        console.log("User inserted successfully");
        return result.rowsAffected; // Return the number of rows affected
    } catch (err) {
        if (err.errorNum === 1) {
            throw new Error('User already exists');
        }
        console.error("Error occurred while inserting user", err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Connection closed successfully");
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}



// Function to insert the values inside the Admin table

async function insertAdmin(username, age, email, mobile, aadhar, password) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            'INSERT INTO Admins (username, age, email, mobile, aadhar, password) VALUES (:username, :age, :email, :mobile, :aadhar, :password)',
            { username, age, email, mobile, aadhar, password }
        );
        await connection.commit();
        console.log("Admin inserted successfully");
        return result.rowsAffected; // Return the number of rows affected
    } catch (err) {
        if (err.errorNum === 1) {
            throw new Error('Admin already exists');
        }
        console.error("Error occurred while inserting admin", err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Connection closed successfully");
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}


//Exporting the Module

module.exports = {
    insertUser,
    insertAdmin
};
