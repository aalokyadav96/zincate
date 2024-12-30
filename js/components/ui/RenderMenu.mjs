import { createElement } from '../../components/createElement.js';

const renderMenu = (content, menu = []) => {
    const menuSection = createElement('section', { id: 'menu', class: 'menu-section' }, [
        // createElement('h2', {}, ['Menu']),
        ...menu.map(category =>
            createElement('div', { class: 'menu-item' }, [
                createElement('h3', {}, [category.name]),
                ...category.items.map(item =>
                    createElement('p', {}, [`${item.name} - $${item.price}`])
                )
            ])
        )
    ]);
    content.appendChild(menuSection);
};

export default renderMenu;
