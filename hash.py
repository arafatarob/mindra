import bcrypt
print(bcrypt.hashpw(b'admin@997690', bcrypt.gensalt()).decode('utf-8'))