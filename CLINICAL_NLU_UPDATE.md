# InteractMD — Clinical NLU & Dialogue Understanding Update

### Summary of Latest Production Release
* **Message Role Classification**: Evaluates clinician dialogue intent (Question, Statement, Advice, Claim, Reassurance) before querying patient state.
* **Management & Relaxation**: Handles deep breathing and relaxation instructions with grounded patient acknowledgement without falling back to memory errors.
* **Lifestyle Advice**: Captures dietary, sleep, caffeine, and exercise advice without leaking social history (smoking/alcohol).
* **Medication Directives**: Directives (such as taking Disprin) are acknowledged without listing existing patient medications or altering active prescriptions.
* **Clinical Claims & Hypotheses**: Claims regarding medicine volumes or empty stomachs are handled in character without fabricating causality.
* **Contextual History Questions**: Resolves multi-slot relationships between medication intake and meal timing.
