const validateFns = {
  names(value) {
    if (!value || value?.length < 7) {
      throw new Error(`Надто коротке ПІБ`);
    }
    if (!/^[А-Яа-яЇїЄєІіҐґ' ]+$/.test(value)) {
      throw new Error(
        `**Неправильний формат ПІБ** \n Вказане значення: \`${value}\` \n Приклад правильньного заповнення: Грушевський Степан Іванович `
      );
    }
    return true;
  },
  phone(value) {
    if (!value || value?.length < 9) {
      throw new Error("Надто короткий номер телефону");
    }
    if (value.length > 12) {
      throw new Error(
        "Номер телефону надто довгий. Скоріш за все він не є дійсним"
      );
    }
    if (!/^(\+380|380|0)\d{9}$/.test(value)) {
      throw new Error(
        `**Невірний формат номеру телефону** \n Вказане значення: \`${value}\` \n Приклад правильного заповнення: \'380689999999\'`
      );
    }
    return true;
  },
  address(value) {
    if (value.length < 6) {
      throw new Error("Надто коротка адреса");
    }
    if (value.length > 60) {
      throw new Error("Надто довга адреса");
    }
    return true;
  },
  postalNumber(value) {
    if (value.length > 15) {
      throw new Error(
        "Надто довгий номер відділення. Вирогідно, він не є дійсним"
      );
    }
    if (Number(value).toString() !== value.toString()) {
      throw new Error("Недійсний номер відділення");
    }
    return true;
  },
};

function validateForm(data) {
  const result = Object.entries(data).reduce((acc, [key, value]) => {
    try {
      const fieldValidationResult = validateFns[key](value);
      acc.push({ id: key, result: { success: fieldValidationResult } });
    } catch (err) {
      acc.push({ id: key, result: { success: false, error: err } });
    } finally {
      return acc;
    }
  }, []);
  return result;
}
module.exports = validateForm;
