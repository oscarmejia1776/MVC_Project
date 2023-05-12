let showPiggyBank = (userId) => {
  //hide the div with id 'login-box'
  $("#login-box").hide();
  $("#piggy_bank").show();
  //make a get request to retrieve all transactions from user with USER_ID
  fetch(`/transactions/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("transactions", data);
      for (let i = 0; i < data.length; i++) {
        const TRANSACTION = $("<div></div>")
          .attr("class", "transaction")
          .text(`${data[i].amount}`);
        $("#transaction_history").append(TRANSACTION);
      }
    });
  //iterate through parsed data find sum of all transactions
  //store value in a variable called total
  //display total amount and transaction by appending them to the DOM.
};
$("#login-button").on("click", () => {
  let username = $("#Username input").val();
  let password = $("#Password input").val();

  fetch(`/users/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("user data", data);
      const STORED_PASSWORD = data.password;
      const USER_ID = data.id;

      if (password === STORED_PASSWORD) {
        showPiggyBank(USER_ID);
      } else {
        console.log("Password Input Was Incorrect");
      }
    });
});
