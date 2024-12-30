
// Reusable Components
function createFormGroup({ label, inputType, inputId, inputValue = '', placeholder = '', isRequired = false, additionalProps = {} }) {
    const group = document.createElement('div');
    group.classList.add('form-group');

    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', inputId);
    labelElement.textContent = label;

    let inputElement;
    if (inputType === 'textarea') {
        inputElement = document.createElement('textarea');
        inputElement.textContent = inputValue;
    } else {
        inputElement = document.createElement('input');
        inputElement.type = inputType;
        inputElement.value = inputValue;
    }

    inputElement.id = inputId;
    if (placeholder) inputElement.placeholder = placeholder;
    if (isRequired) inputElement.required = true;

    // Apply additional properties
    Object.entries(additionalProps).forEach(([key, value]) => {
        inputElement[key] = value;
    });

    group.appendChild(labelElement);
    group.appendChild(inputElement);
    return group;
}

export {createFormGroup};