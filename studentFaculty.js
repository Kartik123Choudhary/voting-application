const express = require('express');
const router = express.Router();
const Database = require('./Database'); // Import the Database module correctly
const bcrypt = require('bcryptjs');


// Middleware to log current user
router.use((req, res, next) => {
    console.log('Current User:', req.user); // Log the user
    next();
});


// Vote Route (casting vote)
router.post('/vote', async (req, res) => {
    const { aadhar, candidateId } = req.body;

    console.log('Vote request received:', { aadhar, candidateId });

    if (req.user && req.user.role === 'admin') {
        return res.status(403).json({ error: 'Admins are not allowed to vote.' });
    }

    if (!aadhar || !candidateId) {
        return res.status(400).json({ error: 'Aadhar and candidate ID are required.' });
    }

    try {
        const result = await Database.insertVote(aadhar, candidateId);
        res.status(200).json({ message: 'Vote cast successfully.', result });
    } catch (err) {
        console.error("Error casting vote:", err);
        res.status(500).json({ error: 'An error occurred while casting your vote.' });
    }
});


// Function to get the details of the Candidates
router.get('/candidates', async (req, res) => {
    try {
        const candidates = await Database.getAllCandidates();
        res.status(200).json(candidates);
    } catch (err) {
        res.status(500).send('Error fetching candidates');
    }
});


// Function to get the Specific details of the Candidate
router.get('/candidate/:id', async (req, res) => {
    const candidateId = req.params.id;
    try {
        const candidate = await Database.getCandidateById(candidateId);
        if (candidate) {
            res.json(candidate);
        } else {
            res.status(404).json({ message: "Candidate not found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching candidate details" });
    }
});


// Function to get the Counts of the Votes
router.get('/vote-counts', async (req, res) => {
    try {
        const voteCounts = await Database.getVoteCounts();
        res.status(200).json(voteCounts);
    } catch (err) {
        console.error("Error fetching vote counts:", err);
        res.status(500).json({ error: 'Error fetching vote counts' });
    }
});



// Function to Insert The candidate table
router.post('/admin/add-candidate', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    const candidate = req.body;
    try {
        if (Array.isArray(candidate) && candidate.length > 0) {
            await Database.insertCandidate(candidate);
            res.status(200).json({ message: 'Candidates added successfully' });
        } else {
            res.status(400).json({ message: 'Invalid candidate data' });
        }
    } catch (err) {
        console.error("Error adding candidate:", err);
        res.status(500).json({ message: 'Error adding candidate' });
    }
});



// Function to update the candidate details
router.put('/admin/update-candidate/:id', async (req, res) => {
    const candidateId = parseInt(req.params.id);
    const { name, party } = req.body;

    try {
        const rowsAffected = await Database.updateCandidate(candidateId, name, party);
        console.log(`Rows affected: ${rowsAffected}`);
        if (rowsAffected > 0) {
            res.status(200).json({ message: 'Candidate updated successfully.' });
        } else {
            res.status(404).json({ message: 'Candidate not found or no changes made.' });
        }
    } catch (err) {
        console.error('Error occurred while updating candidate:', err);
        res.status(500).json({ error: 'An error occurred while updating the candidate' });
    }
});





// Function to delete the details of the Candidate (which should be done by the ADMIN)
router.delete('/admin/delete-candidate/:id', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    const candidateId = req.params.id;
    try {
        await Database.deleteCandidate(candidateId);
        res.status(200).json({ message: "Candidate deleted successfully" });
    } catch (err) {
        console.error("Error deleting candidate:", err);
        res.status(500).json({ message: "Error deleting candidate" });
    }
});


// Route for Changing Password
router.post('/change-password', async (req, res) => {
    const { newPassword } = req.body;
    const { username, role } = req.user; // This should be populated by verifyToken middleware

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const rowsAffected = await Database.updatePassword(username, hashedPassword, role); // Use Database.updatePassword
        
        if (rowsAffected > 0) {
            res.status(200).json({ message: 'Password updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found or no change in password' });
        }
    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json({ message: 'Error updating password' });
    }
});




//Exporting the modules

module.exports = router;
