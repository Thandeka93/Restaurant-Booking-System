import express from "express";
import pgp from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import flash from "express-flash";
import session from "express-session";
import pgPromise from "pg-promise";
import restaurant from "./services/restaurant.js";

const app = express()

const connectionString = process.env.PGDATABASE_URL || 'postgres://ronwtcyb:wybzG-lJSU1S94WCmaOs5Abh49P8dahJ@dumbo.db.elephantsql.com/ronwtcyb';
const pgPro = pgPromise();
const db = pgPro(connectionString)

const restaurantAPI = restaurant(db);

app.use(express.static('public'));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

// Configure express-session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.get("/", async (req, res) => {
    try {const tables = await restaurantAPI.getTables();
    res.render('index', { tables : tables})
    }catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/bookings", (req, res) => {
    res.render('bookings', { tables : [{}, {}, {}, {}, {}, {}]})
});


app.post("/book", async (req, res) => {
    // Get username, phone number, booking size
    const { username, phone_number, booking_size, tableId } = req.body;

    // INSERT booking details into the factory function
    const result = await restaurantAPI.bookTable({
        username,
        phone_number,
        booking_size,
        tableId
    });
    // Check if the result is a success message
    if (result === "Table booked successfully") {
        req.flash("success", result);
    } else {
        req.flash("error", result);
    }

    // GET back to the home route
    res.redirect("/");
});

// Route: Show bookings made by a given user
app.get("/bookings/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const userBookings = await restaurantAPI.getBookedTablesForUser(username);
        res.render('userBookings', { userBookings });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Route: Cancel a booking
app.post("/cancel", async (req, res) => {
    try {
        const { username, tableName } = req.body; // Use req.body to get the parameters
        // Call the restaurantAPI.cancelTableBooking function with username and tableName
        const canceledBooking = await restaurantAPI.cancelTableBooking(tableName); // Correct the function call
        if (canceledBooking) {
            req.flash("success", "Booking canceled successfully");
        } else {
            req.flash("error", "Booking not found or unable to cancel");
        }
        res.redirect(`/bookings/${username}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


var portNumber = process.env.PORT || 3000;

//start everything up
app.listen(portNumber, function () {
    console.log('🚀  server listening on:', portNumber);
});