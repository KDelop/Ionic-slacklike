// import Quill from 'quill';

// const Embed = Quill.import('blots/embed');


// class CommandBlot extends Embed {
//   static create(data) {
//     const node = super.create();
//     const denotationChar = document.createElement('span');
//     denotationChar.className = 'ql-command-denotation-char';
//     denotationChar.innerHTML = data.denotationChar;
//     node.appendChild(denotationChar);
//     node.innerHTML += `${data.name} `;
//     return CommandBlot.setDataValues(node, data);
//   }

//   static setDataValues(element, data) {
//     const domNode = element;
//     Object.keys(data).forEach((key) => {
//       domNode.dataset[key] = data[key];
//     });
//     return domNode;
//   }

//   static value(domNode) {
//     return domNode.dataset;
//   }
// }

// CommandBlot.blotName = 'command';
// CommandBlot.tagName = 'span';
// CommandBlot.className = 'command';

// Quill.register(CommandBlot);
