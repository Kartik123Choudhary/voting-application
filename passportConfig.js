const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');

//Eastablishing the Connection

const dbConfig = {
    user: "system",
    password: "22bce1095",
    connectString: "localhost:1521/XEPDB1"
};



// User Configuration
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const sql = 'SELECT * FROM Users WHERE username = :username';
        const result = await connection.execute(sql, [username]);

        if (result.rows.length === 0) {
            return done(null, false, { message: 'Invalid username or password' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.PASSWORD);

        if (!isMatch) {
            return done(null, false, { message: 'Invalid username or password' });
        }

        // Include role in the user object
        user.ROLE = user.ROLE; // Adjust based on your actual column name

        return done(null, user);

    } catch (err) {
        return done(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("The connection has been closed successfully");
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}));



// Admin Configuration
passport.use('admin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const sql = 'SELECT * FROM Admins WHERE username = :username';
        console.log(`Executing SQL: ${sql} with username: ${username}`); // Added log
        const result = await connection.execute(sql, [username]);
        console.log(`SQL result: ${JSON.stringify(result.rows)}`); // Added log

        if (result.rows.length === 0) {
            console.log('Admin not found'); // Added log
            return done(null, false, { message: 'Invalid admin username or password' });
        }

        const admin = result.rows[0];
        console.log(`Fetched admin: ${JSON.stringify(admin)}`); // Added log
        const isMatch = await bcrypt.compare(password, admin.PASSWORD);
        console.log(`Password match: ${isMatch}`); // Added log

        if (!isMatch) {
            return done(null, false, { message: 'Invalid admin username or password' });
        }

        // Include role in the admin object
        admin.ROLE = 'admin'; // Hardcoded role for admin

        return done(null, admin);

    } catch (err) {
        return done(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("The connection has been closed successfully");
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}));


//Exporting the module

module.exports = passport;
