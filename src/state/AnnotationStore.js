class AnnotationStore {
  constructor() {
    this.enabledByUri = new Set();
  }

  enable(uriString) {
    this.enabledByUri.add(uriString);
  }

  disable(uriString) {
    this.enabledByUri.delete(uriString);
  }

  toggle(uriString) {
    if (this.enabledByUri.has(uriString)) {
      this.enabledByUri.delete(uriString);
      return false;
    }
    this.enabledByUri.add(uriString);
    return true;
  }

  isEnabled(uriString) {
    return this.enabledByUri.has(uriString);
  }

  listEnabledUris() {
    return Array.from(this.enabledByUri);
  }
}

module.exports = {
  AnnotationStore
};
