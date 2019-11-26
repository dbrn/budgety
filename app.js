var BudgetController = (function () {

  var Expense = function(ID, description, value) {
    this.ID = ID;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(ID, description, value) {
    this.ID = ID;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {

      var newItem, ID;

      // Create a new ID, if this is the first element the ID will be 0
      data.allItems[type].length === 0 ? ID = 0 : ID = data.allItems[type][data.allItems[type].length-1].ID + 1;

      // Create a new object of the right type
      if (type === "exp") { newItem = new Expense(ID, des, val); }
      else if (type === "inc") { newItem = new Income(ID, des, val); }

      // Insert the new object in to the data array of its type
      data.allItems[type].push(newItem);

      // Return the new object
      return newItem;
    },

    calculatePercentages: function() {

      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals["inc"]);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
    },

    calculateBudget: function() {

      // Calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
      else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.ID;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    }
  };

})();

var UIController = (function() {

  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, sign;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, int.length);
    }
    type === "exp" ? sign = "-" : sign = "+";
    return sign + " " + int + "." + dec;
  };

  var nodeListForEach = function(list, callback) {
    for(var i = 0; i < list.length; i++){
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // will be either Inc or Exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }
      else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      // Replace the placeholder with data
      newHtml = html.replace("%id%", obj.ID);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);

    },

    deleteListItem: function(selectorID) {
      var element;

      element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    displayPercentages: function(percentages) {
      var fields;

      fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + " %";
        } else {
          current.textContent = "---";
        }
      });
    },

    getDOMStrings: function() {
      return DOMStrings;
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields =  document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      })
      fieldsArr[0].focus();
    },

    displayMonth: function() {
      var now, year, month, months;
      now = new Date();
      year = now.getFullYear();
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      month = now.getMonth();
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year;
    },

    changedType: function() {
      var fields;
      fields = document.querySelectorAll(DOMStrings.inputType + ", " + DOMStrings.inputDescription + ", " + DOMStrings.inputValue);
      nodeListForEach(fields, function(cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    },

    displayBudget: function(obj) {
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, obj.budget >= 0 ? "inc" : "exp");
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
      }
      else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    }
  };

})();


var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // update budget
      updateBudget();

      // Calculate and update the percentages
      updatePercentages();
    }
  };

  var updatePercentages = function () {

    // update percentages
    budgetCtrl.calculatePercentages();

    // read percentages from the BudgetController
    var percentages = budgetCtrl.getPercentages();

    // update UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var updateBudget = function() {

    // Calculate the budget
    budgetCtrl.calculateBudget();

    // return the budget
    var budget = budgetCtrl.getBudget();

    // Display the budget
    UICtrl.displayBudget(budget);
  };

  var ctrlAddItem = function() {

    var input, newItem;
    // Get field input data
    input = UICtrl.getInput();

    if (input.description !== "" && isNaN(input.value) == false && input.value > 0) {
      // Add item to the budget BudgetController
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // Add new item to the user interface
      UICtrl.addListItem(newItem, input.type);

      // Clear the fields
      UICtrl.clearFields();

      // Calculate and update budget
      updateBudget();

      // calculate and update the percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("App started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };

})(BudgetController, UIController);

controller.init();
