import React, { useState } from 'react'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'

// iOS gives every "Add to Home Screen" icon its own isolated storage, even
// for the same URL — deleting and re-adding an icon starts fresh with none
// of the old data. This is the escape hatch: copy your data out as text,
// paste it into wherever you need it.
export default function BackupPopup({ onClose }) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [mode, setMode] = useState('export')
  const [importText, setImportText] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  const exportData = JSON.stringify(
    { todoLists: state.todoLists, todos: state.todos, activeListId: state.activeListId },
    null,
    2
  )

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(exportData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy automatically — tap the text below, select all, and copy it manually.')
    }
  }

  function restore() {
    setError(null)
    let parsed
    try {
      parsed = JSON.parse(importText)
    } catch {
      setError('Could not read that — make sure you pasted the whole backup text.')
      return
    }
    if (!parsed || !Array.isArray(parsed.todoLists) || !Array.isArray(parsed.todos)) {
      setError("That doesn't look like a valid backup.")
      return
    }
    dispatch({ type: 'RESTORE_BACKUP', payload: parsed })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <h2>Backup &amp; Restore</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="backup-tabs">
          <button
            type="button"
            className={`backup-tab ${mode === 'export' ? 'active' : ''}`}
            onClick={() => setMode('export')}
          >
            Export
          </button>
          <button
            type="button"
            className={`backup-tab ${mode === 'import' ? 'active' : ''}`}
            onClick={() => setMode('import')}
          >
            Import
          </button>
        </div>

        {mode === 'export' ? (
          <>
            <p className="backup-hint">
              Copy this text, then use Import on the other device or app to bring it in.
            </p>
            <textarea
              readOnly
              value={exportData}
              className="backup-textarea"
              onFocus={(e) => e.target.select()}
            />
            <div className="modal-actions">
              <button type="button" className="modal-confirm" onClick={copyToClipboard}>
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="backup-hint">Paste backup text below, then Restore. This replaces everything currently here.</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your backup text here"
              className="backup-textarea"
            />
            <div className="modal-actions">
              <button type="button" className="modal-confirm" disabled={!importText.trim()} onClick={restore}>
                Restore
              </button>
            </div>
          </>
        )}

        {error && <p className="backup-error">{error}</p>}
      </div>
    </div>
  )
}
