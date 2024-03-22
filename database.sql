create table users(
    id int primary key AUTO_INCREMENT,
    name VARCHAR(250),
    contact VARCHAR(20),
    email varchar(100),
    password varchar(250),
    status VARCHAR (20),
    role VARCHAR(20),
    UNIQUE (email)
);

insert into users( name, contact, email, password, status, role)
value ('THE ACADEMY', '559003441', 'theacademy@gmailcom', 'admin123', true, 'admin');