const restaurant = (db) => {

    async function getTables() {
        // get all the available tables
        // Check if all tables are not booked
        const tables = db.manyOrNone("SELECT * FROM table_booking");
        // GET all the tables with false booked records
        return tables;
    }

    async function bookTable(book) {
        // Book a table by name
        const tableName = book.tableId;
        const seat = book.booking_size;
        const name = book.username;
        const number = book.phone_number;
    
        // Check if the table exists
        const tableExists = await db.oneOrNone(`SELECT * FROM table_booking WHERE table_name = $1`, [tableName]);
    
        if (tableExists === null) {
            return "Invalid table name provided";
        }
    
        // Check if the table is available
        const tableCapacity = tableExists.capacity;
        const bookedSeats = await db.oneOrNone(`SELECT COUNT(*) FROM table_booking WHERE table_name = $1 AND booked = true`, [tableName]);
        const availableSeats = tableCapacity - bookedSeats;
    
        if (seat > availableSeats) {
            return "Not enough available seats for this booking";
        }
    
        // Check for valid username and phone number
        if (name === "") {
            return "Please enter a username";
        }
    
        if (number === "") {
            return "Please enter a contact number";
        }
    
        // Book the table
        await db.query(`
            INSERT INTO table_booking (table_name, booked, username, number_of_people, contact_number) 
            VALUES ($1, true, $2, $3, $4)`, [tableName, name, seat, number]);
    
        return "Table booked successfully";
    }
    

    async function getBookedTables() {
        // get all the booked tables
        //returning the true for booked
        return await db.manyOrNone("SELECT table_name, capacity, number_of_people, username, contact_number FROM table_booking where booked = $1", true);
    }

    async function isTableBooked(tableName) {
        // get booked table by name
        return await db.manyOrNone(`SELECT booked FROM table_booking WHERE table_name = '${tableName}'`).booked;
       
    }


    async function cancelTableBooking(tableName) {
        // cancel a table by name
        await db.none(`UPDATE table_booking SET booked = ${false}, SET username = ${""}, SET number_of_people = '${null}', SET contact_number = '${null}' WHERE table_name= '${tableName}'`);
        
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
        return await db.oneOrNone(`SELECT table_name FROM table_booking WHERE username = '${username}'`);
        
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