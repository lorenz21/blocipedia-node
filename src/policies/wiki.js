const ApplicationPolicy = require("./application");

module.exports = class WikiPolicy extends ApplicationPolicy {

  create() {
    return this.new();
  }

  update() {
    return this.edit();
  }

  edit() {
    return this._isOwner() || this._isAdmin() || this._isPublic();
  }

  destroy() {
    return this.update();
  }
}