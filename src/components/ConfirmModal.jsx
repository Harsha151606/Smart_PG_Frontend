import React from "react";

function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-grand" onClick={!loading ? onCancel : undefined}>
      <div
        className="modal-dialog-grand"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header-grand">
          <div className={`modal-icon-badge modal-icon-${confirmVariant}`}>
            {confirmVariant === "danger" ? "🗑️" : "ℹ️"}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "var(--navy-900)" }}>
              {title}
            </h3>
          </div>
        </div>

        <div className="modal-body-grand">
          <p style={{ margin: 0 }}>{message}</p>
        </div>

        <div className="modal-footer-grand">
          <button
            type="button"
            className="btn-grand btn-secondary-grand btn-sm-grand"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn-grand ${
              confirmVariant === "danger" ? "btn-danger-grand" : "btn-primary-grand"
            } btn-sm-grand`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
