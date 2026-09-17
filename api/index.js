// CommonJS é um Ecossistema JavaScript server-side
// É o padrão utilizado no Node.js para modularização

module.exports = async (req, res) => {
    const modules = await import("../server/server.js");
    return modules.default(req, res);
};