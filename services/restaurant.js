const restaurant = (db) => {

    async function getTables() {
        // get all the available tables
        // Check if all tables are not booked
        const tables = db.manyOrNone("SELECT * FROM table_booking");
        // GET all the tables with false booked records
        return tables;
    }

    async function bookTable(tableName, username, numberOfPeople, contactNumber) {
        // Book a table by name
        const query = `
            INSERT INTO table_booking (table_name, booked, username, number_of_people, contact_number)
            VALUES ($1, true, $2, $3, $4)
            RETURNING *;
        `;
        const values = [tableName, username, numberOfPeople, contactNumber];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async function getBookedTables() {
        // get all the booked tables
        const query = "SELECT * FROM table_booking WHERE booked = true";
        const result = await db.query(query);
        return result.rows;
    }

    async function isTableBooked(tableName) {
         // get booked table by name
        const query = "SELECT * FROM table_booking WHERE table_name = $1 AND booked = true";
        const result = await db.query(query, [tableName]);
        return result && result.rows && result.rows.length > 0;
    }
    

    async function cancelTableBooking(tableName) {
        // cancel a table by name
        const query = "UPDATE table_booking SET booked = false, username = null, number_of_people = null, contact_number = null WHERE table_name = $1 RETURNING *";
        const result = await db.query(query, [tableName]);
        return result.rows[0];
    }

    async function editTableBooking(tableName, username, numberOfPeople, contactNumber) {
        // Edit a table booking by name
        const query = `
            UPDATE table_booking 
            SET username = $2, number_of_people = $3, contact_number = $4
            WHERE table_name = $1 AND booked = true
            RETURNING *;
        `;
        const values = [tableName, username, numberOfPeople, contactNumber];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async function getBookedTablesForUser(username) {
        // get user table booking
        const query = "SELECT * FROM table_booking WHERE username = $1 AND booked = true";
        const result = await db.query(query, [username]);
        return result.rows;
    }

    return {
        getTables,
        bookTable,
        getBookedTables,
        isTableBooked,
        cancelTableBooking,
        editTableBooking,
        getBookedTablesForUser
    }
}

export default restaurant;