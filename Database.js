const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


//Eastablishing the Connection

const dbConfig = {
    user: "system",
    password: "22bce1095",
    connectString: "localhost:1521/XEPDB1"
};



// Displaying All the Information about the Candidates (by admin and user)
async function getAllCandidates() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log("Connection established successfully with the Oracle Database");
        const sql = 'SELECT * FROM Candidates';
        const result = await connection.execute(sql);
        console.log("All records fetched successfully from the Candidates table", result.rows);
        return result.rows;
    } catch (err) {
        console.log("Error while fetching records from the Candidates table", err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('The connection has been closed successfully');
            } catch (err) {
                console.log("Error while closing the connection", err);
            }
        }
    }
}



// Inserting the Records into the Candidates Table (by admin)
async function insertCandidate(candidate) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log("Connection established successfully with the Oracle Database");
        const sql = 'INSERT INTO Candidates (name, party) VALUES (:name, :party)';
        const binds = candidate.map(can => ({ name: can.name, party: can.party }));
        const options = { autoCommit: true, batchErrors: true };
        const result = await connection.executeMany(sql, binds, options);
        console.log("Records inserted successfully into the Candidates table", result);
        return result;
    } catch (err) {
        console.log("Error while inserting records into the Candidates table", err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('The connection has been closed successfully');
            } catch (err) {
                console.log("Error while closing the connection", err);
            }
        }
    }
}


//Inserting the Values inside the Votes table

async function insertVote(aadhar, candidateId) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const checkSql = 'SELECT * FROM Votes WHERE aadhar = :aadhar';
        const checkResult = await connection.execute(checkSql, { aadhar });
        if (checkResult.rows.length > 0) {
            throw new Error('User has already voted');
        }

        const sql = 'INSERT INTO Votes (aadhar, candidate_id) VALUES (:aadhar, :candidateId)';
        const binds = { aadhar, candidateId };
        const options = { autoCommit: true };
        const result = await connection.execute(sql, binds, options);
        console.log("Vote inserted successfully", result);
        return result;
    } catch (err) {
        console.error("Error inserting vote:", err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Connection closed successfully');
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}



// Function to count the Votes ( in descending order )

async function getVoteCounts() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const sql = `
            SELECT 
                c.candidate_id,
                c.name,
                COUNT(v.candidate_id) AS vote_count
            FROM 
                Candidates c
                LEFT JOIN Votes v ON c.candidate_id = v.candidate_id
            GROUP BY 
                c.candidate_id, c.name
            ORDER BY 
                vote_count DESC
        `;
        
        const result = await connection.execute(sql);
        console.log("Vote counts fetched successfully", result.rows);
        return result.rows;
    } catch (err) {
        console.error("Error while fetching records from the Votes table", err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Connection has been closed successfully');
            } catch (err) {
                console.error("Error closing connection", err);
            }
        }
    }
}


// Function to get the details of a specific candidate (by user and admin)
async function getCandidateById(candidateId) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log("Connection established successfully with the Oracle Database");
        const sql = 'SELECT * FROM Candidates WHERE candidate_id = :candidateId';
        const result = await connection.execute(sql, { candidateId });
        console.log("Records fetched successfully from the Candidates table", result.rows);
        return result.rows;
    } catch (err) {
        console.log("Error while fetching records from the Candidates table", err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('The connection has been closed successfully');
            } catch (err) {
                console.log("Error while closing the connection", err);
            }
        }
    }
}

// Updating function to update the content of the table Candidates (by admin)
async function updateCandidate(candidateId, name, party) {
    const connection = await oracledb.getConnection(dbConfig);
    try {
        const result = await connection.execute(
            `UPDATE Candidates SET name = :name, party = :party WHERE candidate_id = :candidateId`,
            { name, party, candidateId },
            { autoCommit: true }
        );
        return result.rowsAffected;
    } catch (err) {
        console.error('Error updating candidate:', err);
        throw err;
    } finally {
        await connection.close();
    }
}




// Delete function (to delete the content of the Candidate table by taking "candidateId" as the key) (done by admin)
async function deleteCandidate(candidateId) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const sql = 'DELETE FROM Candidates WHERE candidate_id = :candidateId';
        const binds = { candidateId };
        const options = { autoCommit: true };
        const result = await connection.execute(sql, binds, options);
        console.log("Data deleted successfully from the Candidates table", result);
        return result;
    } catch (err) {
        console.log("Error while deleting data from the Candidates table", err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Connection has been closed successfully");
            } catch (err) {
                console.log("Error while closing the connection", err);
            }
        }
    }
}


// Function to update the password
async function updatePassword(username, newPassword, role) {
    let tableName = role === 'admin' ? 'Admins' : 'Users';
    const sql = `UPDATE ${tableName} SET password = :password WHERE LOWER(username) = LOWER(:username)`;
    const binds = {
        password: newPassword,
        username: username
    };

    console.log(`Updating password for user: ${username} with role: ${role}`);
    console.log(`Executing SQL: ${sql}`);
    console.log('With binds:', binds);

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, binds, { autoCommit: true });
        console.log(`Password updated successfully. Rows affected: ${result.rowsAffected}`);
        return result.rowsAffected;
    } catch (err) {
        console.error("Error updating password:", err);
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



//Exporting the modules

module.exports = {
    getAllCandidates,
    insertCandidate,
    insertVote,
    getVoteCounts,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    updatePassword
};

