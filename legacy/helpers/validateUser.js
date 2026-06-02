const validName = (name) => {
  return name && name != " "
}

const validEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validatePhone = (phone) => {
  return phone.toString().replace(/\D/g, '')
}

const validateUser = ({ name, email, phone }) => {
  if (!validName(name)) { return { error: "Please enter your name" } }
  if (!validEmail(email)) { return { error: "Invalid email address" } }
  if(!phone || phone.length < 10) { return { error: "Invalid phone number" } }
  phone = validatePhone(phone)
  return { 
    name, 
    email, 
    phone
  };
}

export default validateUser;