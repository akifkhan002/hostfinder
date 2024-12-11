CREATE DATABASE hostfinder;
USE hostfinder;

-- Create User Table
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Owner Table
CREATE TABLE owner (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Accommodation Table with SET for room_sharing
CREATE TABLE accommodation (
    accommodation_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    accommodation_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
	location VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    description TEXT NOT NULL,
    total_rooms INT NOT NULL,
    gender_preference ENUM('boys', 'girls', 'both') DEFAULT 'both',
    food_type ENUM('veg', 'non-veg', 'both') DEFAULT 'both',
    room_sharing SET('single','double','triple') NOT NULL,
    bathroom SET('attach', 'common') NOT NULL,
    facilities JSON,
    restrictions TEXT NOT NULL,
    pictures JSON,
    contact varchar(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owner(owner_id) ON DELETE CASCADE
);

-- Create Location Table
CREATE TABLE location (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    accommodation_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (accommodation_id) REFERENCES accommodation(accommodation_id) ON DELETE CASCADE
);

-- Create Roommate Requests Table
CREATE TABLE roommate_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    profession VARCHAR(100) NOT NULL,
    room_sharing SET('double', 'triple') NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    contact VARCHAR(10) NOT NULL,
    email VARCHAR(255),
    pictures varchar(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE accommodation_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    accommodation_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    description TEXT NOT NULL,
    total_rooms INT NOT NULL,
    gender_preference ENUM('boys', 'girls', 'both') DEFAULT 'both',
    food_type ENUM('veg', 'non-veg', 'both') DEFAULT 'both',
    room_sharing SET('single', 'double', 'triple') NOT NULL,
    bathroom SET('attach', 'common') NOT NULL,
    facilities JSON,
    restrictions TEXT NOT NULL,
    pictures JSON,
    contact VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owner(owner_id) ON DELETE CASCADE
);

INSERT INTO owner (email, password, created_at) VALUES
('owner1@example.com', '123', CURRENT_TIMESTAMP),
('owner2@example.com', '123', CURRENT_TIMESTAMP),
('owner3@example.com', '123', CURRENT_TIMESTAMP),
('owner4@example.com', '123', CURRENT_TIMESTAMP),
('owner5@example.com', '123', CURRENT_TIMESTAMP),
('owner6@example.com', '123', CURRENT_TIMESTAMP),
('owner7@example.com', '123', CURRENT_TIMESTAMP),
('owner8@example.com', '123', CURRENT_TIMESTAMP),
('owner9@example.com', '123', CURRENT_TIMESTAMP),
('owner10@example.com', '123', CURRENT_TIMESTAMP);


INSERT INTO accommodation (owner_id, accommodation_name, price, location, address, landmark, description, total_rooms, gender_preference, food_type, room_sharing, bathroom, facilities, restrictions, pictures, contact, created_at) VALUES
(1, 'Sunshine PG', 7500.00, 'Bengaluru', '5th Cross Road, Koramangala', 'Near Forum Mall', 'Affordable stay for working professionals', 10, 'both', 'both', 'single,double', 'attach', '["wifi", "laundry", "parking"]', 'No pets allowed', '["images/cover_image1.jpg", "images/pg_image2.jpg", "images/pg_image3.jpg", "images/pg_image4.jpg"]', '9876543210', CURRENT_TIMESTAMP),
(2, 'GreenNest Hostel', 6000.00, 'Pune', 'Lane 6, Viman Nagar', 'Opposite Phoenix Market City', 'Spacious and comfortable hostel', 15, 'boys', 'veg', 'double', 'common', '["security", "laundry"]', 'Smoking not allowed', '["images/cover_image2.jpg", "images/pg_image6.jpg", "images/pg_image14.jpg", "images/pg_image15.jpg"]', '9823456789', CURRENT_TIMESTAMP),
(3, 'BlueHeaven Stay', 8500.00, 'Mumbai', 'Central Avenue, Powai', 'Next to Hiranandani Gardens', 'Premium rooms for IT professionals', 12, 'girls', 'both', 'single,double', 'attach,common', '["wifi", "gym", "laundry"]', 'No loud music', '["images/cover_image3.jpg", "images/pg_image7.jpg", "images/pg_image4.jpg", "images/pg_image9.jpg"]', '9987654321', CURRENT_TIMESTAMP),
(4, 'CozyStay', 5000.00, 'Kolkata', 'Sector V, Salt Lake', 'Near Technopolis Building', 'Cozy rooms for students', 8, 'both', 'veg', 'triple', 'attach', '["wifi", "kitchen"]', 'No alcohol', '["images/cover_image4.jpg", "images/pg_image5.jpg", "images/pg_image10.jpg", "images/pg_image11.jpg"]', '9876541234', CURRENT_TIMESTAMP),
(5, 'GreenLeaf Hostel', 7000.00, 'Hyderabad', '2nd Street, Gachibowli', 'Close to DLF Cyber City', 'Eco-friendly accommodations', 20, 'both', 'non-veg', 'double', 'common', '["wifi", "laundry", "garden"]', 'No pets allowed', '["images/cover_image5.jpg", "images/pg_image4.jpg", "images/pg_image13.jpg", "images/pg_image12.jpg"]', '9123456789', CURRENT_TIMESTAMP),
(6, 'UrbanNest Stay', 8000.00, 'Bengaluru', '12th Main Road, Indiranagar', 'Near CMH Road Metro Station', 'Modern accommodation with urban amenities', 15, 'both', 'both', 'single,double', 'attach,common', '["wifi", "laundry", "security"]', 'No smoking', '["images/cover_image6.jpg", "images/pg_image13.jpg", "images/pg_image14.jpg", "images/pg_image15.jpg"]', '9876541110', CURRENT_TIMESTAMP),
(7, 'SilverLeaf PG', 6500.00, 'Noida', 'Block B, Sector 62', 'Near Electronic City Metro Station', 'Budget-friendly stay for IT professionals', 10, 'boys', 'veg', 'double,triple', 'common', '["wifi", "parking", "laundry"]', 'No alcohol allowed', '["images/cover_image7.jpg", "images/pg_image16.jpg", "images/pg_image17.jpg", "images/pg_image18.jpg"]', '9865321457', CURRENT_TIMESTAMP),
(8, 'GoldenHeaven Hostel', 9000.00, 'Chennai', '3rd Avenue, Anna Nagar', 'Close to Thirumangalam Metro Station', 'Luxury hostel with premium facilities', 20, 'girls', 'both', 'single', 'attach', '["wifi", "gym", "laundry", "security"]', 'No pets allowed', '["images/cover_image8.jpg", "images/pg_image12.jpg", "images/pg_image15.jpg", "images/pg_image17.jpg"]', '9845123678', CURRENT_TIMESTAMP),
(9, 'Lakeview PG', 5500.00, 'Bengaluru', '5th Main Road, Hebbal', 'Near Manyata Tech Park', 'Comfortable rooms with scenic views', 12, 'both', 'veg', 'double,triple', 'attach,common', '["wifi", "laundry", "kitchen"]', 'No loud music', '["images/cover_image9.jpg", "images/pg_image11.jpg", "images/pg_image14.jpg", "images/pg_image18.jpg"]', '9876512340', CURRENT_TIMESTAMP),
(10, 'TranquilStay', 7500.00, 'Hyderabad', 'Road No. 3, Banjara Hills', 'Next to City Center Mall', 'Peaceful accommodation for professionals', 18, 'both', 'non-veg', 'single,double', 'attach','["wifi", "laundry", "kitchen"]', 'No loud music', '["images/cover_image10.jpg", "images/pg_image10.jpg", "images/pg_image12.jpg", "images/pg_image13.jpg"]', '9123567890', CURRENT_TIMESTAMP);

INSERT INTO location (accommodation_id, location, latitude, longitude) VALUES
(1, 'Bengaluru', 12.935192, 77.624481),
(2, 'Pune', 18.567916, 73.914315),
(3, 'Mumbai', 19.120565, 72.904960),
(4, 'Kolkata', 22.586786, 88.417907),
(5, 'Hyderabad', 17.446739, 78.357039),
(6, 'Bengaluru', 12.971598, 77.641437),
(7, 'Noida', 28.630389, 77.368574),
(8, 'Chennai', 13.084622, 80.217817),
(9, 'Bengaluru', 13.035772, 77.597083),
(10, 'Hyderabad', 17.412348, 78.429386);

INSERT INTO location (accommodation_id, location, latitude, longitude) VALUES
(1, 'Bengaluru', 12.935192, 77.624481),
(2, 'Pune', 18.567916, 73.914315),
(3, 'Mumbai', 19.120565, 72.904960),
(4, 'Kolkata', 22.586786, 88.417907),
(5, 'Hyderabad', 17.446739, 78.357039),
(6, 'Bengaluru', 12.971598, 77.641437),
(7, 'Noida', 28.630389, 77.368574),
(8, 'Chennai', 13.084622, 80.217817),
(9, 'Bengaluru', 13.035772, 77.597083),
(10, 'Hyderabad', 17.412348, 78.429386);

INSERT INTO user (email, password, created_at) VALUES
('akifullakhan82@gmail.com', '123', CURRENT_TIMESTAMP),
('nehagowda@gmail.com', '123', CURRENT_TIMESTAMP),
('bhoomikasc@gmail.com', '123', CURRENT_TIMESTAMP),
('ganeshbabu@gmail.com', '123', CURRENT_TIMESTAMP);

INSERT INTO roommate_requests (user_id, name, age, gender, profession, room_sharing, location, description, requirements, contact, email, pictures, created_at) VALUES
(1, 'Rohan Gupta', 25, 'male', 'Software Developer', 'double', 'Whitefield, Bengaluru', 'Looking for a clean and quiet roommate', 'Vegetarian preferred', '9876543210', 'rohan.g@example.com', 'images/roommate3.jpg', CURRENT_TIMESTAMP)
,(2, 'Rohan Gupta', 25, 'male', 'Software Developer', 'double', 'Whitefield, Bengaluru', 'Looking for a clean and quiet roommate', 'Vegetarian preferred', '9876543210', 'rohan.g@example.com', 'images/roommate3.jpg', CURRENT_TIMESTAMP)

;


SELECT * FROM accommodation;
select * from roommate_requests;
select * from user;
select * from owner; 
select * from location; 