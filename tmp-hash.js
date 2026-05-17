const bcrypt = require('bcryptjs');
 bcrypt.hash('Admin@123', 10).then(hash => {
   console.log(hash);
 }).catch(err => {
   console.error(err);
   process.exit(1);
 });
