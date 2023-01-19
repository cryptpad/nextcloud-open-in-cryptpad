export default function simpleCache(callable) {
    let hasValue = false;
    let value;

    return function() {
        if (hasValue) {
            return value;
        } else {
            value = callable();
            hasValue = true;
            return value;
        }
    }
}
