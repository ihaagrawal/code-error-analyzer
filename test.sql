SELECT * FROM users;

CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2),
    created_at TIMESTAMP
);

INSERT INTO products (id, name, price)
VALUES (1, 'Laptop', 999.99);

UPDATE products 
SET price = 899.99 
WHERE id = 1;

DELETE FROM products WHERE price > 1000;