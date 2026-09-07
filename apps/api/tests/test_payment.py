from decimal import Decimal

import pytest

from app.services.payment.service import amount_matches, transition_payment


def test_payment_state_machine_rejects_failed_to_paid() -> None:
    with pytest.raises(ValueError):
        transition_payment("failed", "paid")


def test_payment_state_machine_allows_pending_to_paid() -> None:
    transition_payment("pending", "paid")


def test_verified_provider_attempt_can_recover_failed_payment() -> None:
    transition_payment("failed", "paid", verified_provider_event=True)


def test_provider_amount_must_match_minor_units() -> None:
    assert amount_matches(Decimal("530.00"), 53000)
    assert not amount_matches(Decimal("530.00"), 52900)
