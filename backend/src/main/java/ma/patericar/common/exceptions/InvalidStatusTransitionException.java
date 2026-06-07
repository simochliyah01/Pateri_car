package ma.patericar.common.exceptions;

public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(Enum<?> from, Enum<?> to) {
        super(String.format("Cannot transition from %s to %s", from, to));
    }
}
