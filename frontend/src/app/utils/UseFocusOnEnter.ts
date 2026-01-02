
const useFocusOnEnter = (formRef: any) => {
    const onEnterKey = (event: any) => {

        if (event && event.keyCode && event.keyCode === 13 && event.target && event.target.form) {
            const form = event.target.form;
            const index = Array.prototype.indexOf.call(form, event.target);
            for (let i = index + 1; i < formRef.current.length; i++) {
                if (formRef.current[i].tabIndex === -1) {
                    continue
                }
                formRef.current[i].focus();
                if (document.activeElement === formRef.current[i]) {
                    break;
                }
            }
        }
    }

    return {onEnterKey};
}

export default useFocusOnEnter;