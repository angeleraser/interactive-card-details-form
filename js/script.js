class Label {
  constructor(name) {
    this.label = document.getElementById(`input-${name}`);
    this.msgEl = this.label.querySelector(".form-input-invalid-msg");
  }

  setError(msg) {
    this.label.classList.add("invalid");
    this.msgEl.textContent = msg;
  }

  removeError() {
    this.label.classList.remove("invalid");
  }
}

class Input extends Label {
  constructor({ name, id, minLength }) {
    super(id);
    this.inputs = Array.from(this.label.querySelectorAll("input"));
    this.name = name;
    this.minLength = minLength;

    this.inputs.forEach((input) => {
      input.setInvalidState = function () {
        this.classList.add("invalid");
      };

      input.removeInvalidState = function () {
        this.classList.remove("invalid");
      };
    });
  }

  onKeydown(fn) {
    this.inputs.forEach((input) => {
      input.addEventListener("keydown", (e) => {
        this.removeError();
        input.removeInvalidState();
        if (e.key.length === 1) fn(e);
      });
    });
  }

  onChange(fn) {
    this.inputs.forEach((input) => {
      input.addEventListener("input", fn);
    });
  }

  validate() {
    const input = this.inputs[0];

    if (!input.value) {
      this.setError("Can't be blank");
      return input.setInvalidState();
    }

    if (input.value.length < this.minLength) {
      this.setError(`Please enter a valid ${this.name}`);
      return input.setInvalidState();
    }

    return true;
  }

  getValue() {
    return this.inputs
      .map((el) => el.value)
      .join(" ")
      .trim();
  }
}

class MultiInput extends Input {
  constructor({ name, id, minLength }) {
    super({ name, id, minLength });

    this.inputs.forEach((input, i) => {
      input.addEventListener("input", (e) => {
        if (input.value.length === 2) {
          const nextInput = this.inputs[i + 1];
          if (nextInput) nextInput.focus();
        }
      });
    });
  }

  validate() {
    return this.inputs.reduce((isValid, input) => {
      const { value } = input;

      if (!value || value.length < this.minLength) {
        this.setError(
          !value ? "Can't be blank" : `Please enter a valid ${this.name}`
        );
        input.setInvalidState();
      } else {
        this.removeError();
        input.removeInvalidState();
      }

      return value && isValid && value.length === this.minLength;
    }, true);
  }
}

class Section {
  constructor(name) {
    this.el = document.getElementById(`${name}-section`);
  }

  hide() {
    this.el.style.display = "none";
  }

  show() {
    this.el.style.display = "flex";
  }
}

const formEl = document.getElementById("form");
const cardholderNameInput = new Input({
  id: "cardholder-name",
  name: "cardholder name",
  minLength: 3,
});
const cardNumberInput = new Input({
  id: "card-number",
  name: "cardholder number",
  minLength: 19,
});
const cardCvcInput = new Input({ id: "card-cvc", name: "CVC", minLength: 3 });
const cardExpDateInput = new MultiInput({
  id: "card-expdate",
  name: "exp. date",
  minLength: 2,
});

const formSection = new Section("form");
const completeFormSection = new Section("complete-form");

const continueBtn = document.getElementById("continue-btn");
const creditCardNumber = document.getElementById("credit-card-number");
const creditCardOwnerName = document.getElementById("credit-card-ownername");
const creditCardExpdate = document.getElementById("credit-card-expdate");
const creditCardCvc = document.getElementById("credit-card-cvc");

cardholderNameInput.onKeydown((e) => {
  if (/([^a-z\s])|(\d)/gi.test(e.key)) e.preventDefault();
});

cardholderNameInput.onChange(({ target }) => {
  target.value = formatNameInput(target.value);
});

[cardCvcInput, cardNumberInput, cardExpDateInput].forEach((input) => {
  input.onKeydown((e) => {
    if (/\D/.test(e.key)) e.preventDefault();
  });
});

cardNumberInput.onChange(({ target }) => {
  target.value = formatCardNumber(target.value);
});

formEl.addEventListener("submit", (e) => {
  e.preventDefault();

  if (
    ![
      cardCvcInput.validate(),
      cardExpDateInput.validate(),
      cardholderNameInput.validate(),
      cardNumberInput.validate(),
    ].every((isValid) => isValid)
  )
    return;

  formSection.hide();
  completeFormSection.show();

  updateCreditCardHTML({
    holderName: cardholderNameInput.getValue(),
    number: cardNumberInput.getValue(),
    expDate: cardExpDateInput.getValue(),
    cvc: cardCvcInput.getValue(),
  });
});

continueBtn.addEventListener("click", () => location.reload());

function formatNameInput(value) {
  const regex = /([^a-z\s])|(\d)/gi;
  return value.replace(regex, "");
}

function updateCreditCardHTML({ holderName, number, expDate, cvc }) {
  creditCardOwnerName.textContent = holderName;
  creditCardNumber.textContent = number;
  creditCardExpdate.textContent = expDate.replace(" ", "/");
  creditCardCvc.textContent = cvc;
}

/**
 * @link https://stackoverflow.com/a/59339120/20382647
 */
function formatCardNumber(value) {
  const regex = /^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/g;
  const onlyNumbers = value.replace(/[^\d]/g, "");

  return onlyNumbers.replace(regex, (regex, $1, $2, $3, $4) =>
    [$1, $2, $3, $4].filter((group) => !!group).join(" ")
  );
}
