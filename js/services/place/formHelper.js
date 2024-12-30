import { createElement } from "../../components/createElement.js";
import Snackbar from '../../components/ui/Snackbar.mjs';
import { navigate } from "../../routes/index.js";

function createForm(fields, onSubmit) {
    const form = createElement('form', { onsubmit: handleFormSubmit });

    // Handle form submission
    async function handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(form); // Support file inputs
        try {
            await onSubmit(formData);
            Snackbar("Place created successfully!", 3000);
            navigate('/places'); // Redirect to places after success
        } catch (error) {
            console.error("Error creating place:", error);
            Snackbar("Failed to create place. Please try again.", 3000);
        }
    }

    // Build form fields
    fields.forEach(field => {
        const formGroup = createElement('div', { class: 'form-group' }, [
            createElement('label', { for: field.id }, [field.label]),
            createElement(field.type === 'textarea' ? 'textarea' : 'input', {
                id: field.id,
                name: field.id,
                type: field.type || 'text',
                placeholder: field.placeholder,
                value: field.value || '',
                ...(field.required ? { required: true } : {}),
                ...(field.type === 'file' && field.accept ? { accept: field.accept } : {}),
                ...(field.min ? { min: field.min } : {}),
            })
        ]);
        form.appendChild(formGroup);
    });

    // Add submit button
    form.appendChild(createElement('button', { type: 'submit' }, ["Submit"]));
    return form;
}

export {createForm};