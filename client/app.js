var USER_ID;
var totalAmount = 0;
var goalAmount = 0;
///////////////////////createTransaction Function/////////////////////////////////////////
function createTransaction(obj) {
  const DATE_OBJ = new Date(obj.date);
  const SHORT_DATE = DATE_OBJ.toLocaleDateString();
  const SHORT_TIME = DATE_OBJ.toLocaleTimeString();
  const AMOUNT = obj.amount;
  const ID = obj.id;
  totalAmount += AMOUNT;
  const TRANSACTION = $(`<div></div>`)
    .attr("id", `transaction_${ID}`)
    .attr("class", "transaction")
    .append(
      $("<span></span>")
        .addClass("close-button")
        .text("X")
        .on("click", function () {
          const transactionId = $(this)
            .closest(".transaction")
            .attr("id")
            .replace("transaction_", "");
          console.log(transactionId);
          const amount = parseInt(
            $(this).siblings(".amount").text().replace("Amount: $", "")
          );
          console.log(amount);
          totalAmount -= amount;
          $("#savings").text(`Total: $${totalAmount}`);

          // Send DELETE request to remove transaction from the database
          fetch(`/transactions/${transactionId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Transaction deleted successfully", data);
            })
            .catch((error) => {
              console.error("Error deleting transaction", error);
            });

          $(this).closest(".transaction").remove();
        })
    )
    .append($("<p></p>").attr("class", "amount").text(`Amount: $${AMOUNT}`))
    .append($("<p></p>").text(`Date: ${SHORT_DATE}`))
    .append($("<p></p>").text(`Time: ${SHORT_TIME}`));
  $("#transaction_history").append(TRANSACTION);
}
////////////////////////Sign-Up & Login Button/////////////////////////////////////////
$("#signup").on("click", () => {
  $("#start-box").show();
  $("#login-box").hide();
});

$("#start").on("click", () => {
  $("#login-box").show();
  $("#start-box").hide();
});
///////////////////////////Create New User/////////////////////////////////////////////
$("#create").on("click", () => {
  let username = $("#newUsername-input").val();
  let password = $("#newPassword-input").val();

  const newUserData = {
    username: username,
    password: password,
    goal: 0,
  };

  // Empty the error message paragraph
  $("#start-box p.error-message").empty();

  fetch(`/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUserData),
  })
    .then((res) => {
      if (res.status === 422) {
        throw new Error("Username Already Taken");
      }
      return res.json();
    })
    .then((data) => {
      USER_ID = data.id;
      showPiggyBank(USER_ID);
    })
    .catch((error) => {
      console.log(error.message);
      // Append the error message paragraph to start-box div
      $("#start-box").append(
        "<p class='error-message'>" + error.message + "</p>"
      );
    });
});

////////////////////Show Piggy Bank Function///////////////////////////////////////////
let showPiggyBank = (userId) => {
  //hide the div with id 'login-box'
  $(".login-box").hide();
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
        createTransaction(data[i]);
      }
      $("#savings").text(`Savings: $${totalAmount}`);
      $("#goal-input").val(goalAmount);
    });
  $("#start").hide();
  $("#signup").hide();
};
///////////////////Login Button////////////////////////////
$("#login-button").on("click", () => {
  let username = $("#username-input").val();
  let password = $("#password-input").val();

  // Empty the error message paragraph
  $("#login-box p.error-message").empty();

  fetch(`/users/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  })
    .then((res) => {
      if (res.status === 404) {
        throw new Error("Username does not exist. Please signup or try again");
      }
      return res.json();
    })
    .then((data) => {
      console.log("user data", data);
      const isAuthenticated = data.isAuthenticated;
      USER_ID = data.id;
      goalAmount = Number(data.goal);

      if (isAuthenticated) {
        showPiggyBank(USER_ID);
      } else {
        throw new Error("Password Input Was Incorrect. Please try again");
      }
    })
    .catch((error) => {
      console.log(error.message);
      // Append the error message paragraph
      $("#login-box").append(
        "<p class='error-message'>" + error.message + "</p>"
      );
    });
});
//////////////////////Creating New Deposit Transaction///////////////
$("#deposit-button").on("click", () => {
  const amount = parseInt($("#trans_amount input").val());
  console.log(USER_ID);

  const transactionData = {
    type: "Deposit",
    amount: amount,
    user_id: USER_ID,
  };
  console.log(transactionData);

  fetch("/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Transaction created successfully", data);
      // Perform any additional operations after the transaction is created
      //create another transaction div here and add it into transaction history
      createTransaction(data);
      $("#savings").text(`Total: $${totalAmount}`);
    });
});

//////////////////////Creating New Withdrawal Transaction///////////////
$("#withdrawal-button").on("click", () => {
  const amount = -1 * parseInt($("#trans_amount input").val());

  console.log(USER_ID);

  const transactionData = {
    type: "Withdrawal",
    amount: amount,
    user_id: USER_ID,
  };
  console.log(transactionData);

  fetch("/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Transaction created successfully", data);
      // Perform any additional operations after the transaction is created
      //create another transaction div here and add it into transaction history
      createTransaction(data);
      $("#savings").text(`Total: $${totalAmount}`);
    });
});

///////////////Update GOal/////////////////////
$("#actual-goal").on("submit", (event) => {
  event.preventDefault();
  const goal = parseInt($("#goal-input").val());
  const goalObj = {
    goal: goal,
  };
  fetch(`/users/${USER_ID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalObj),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Goal Updated", data);
      goalAmount = goal;
      $("#goal-input").val(goalAmount);
    })
    .catch((error) => {
      console.error("Error updating goal amount", error);
    });
});
