const fs = require('fs');
const data = JSON.parse(fs.readFileSync('clientes_sin_tienda.json', 'utf8'));

let md = `# Clientes sin Tienda Asignada

Estos clientes pertenecían al grupo Default o Palermo y fueron migrados con estado "pendiente".

| ID | Nombre | Email | Teléfono | Grupo Anterior |
|---|---|---|---|---|
`;

data.forEach(c => {
    md += `| ${c.id} | ${c.name} | ${c.email} | ${c.phone || '-'} | ${c.previousGroup} |\n`;
});

fs.writeFileSync('clientes_sin_tienda.md', md);
console.log('Markdown generado en clientes_sin_tienda.md');
