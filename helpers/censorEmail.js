const censorWord = (str) => {
  return str[0] + "*".repeat(str.length - 2) + str.slice(-1);
}

const censorEmail = (email) => {
  var arr = email.split("@");
  return censorWord(arr[0]) + "@" + censorWord(arr[1]);
}

export default censorEmail;