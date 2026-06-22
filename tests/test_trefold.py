import trefold


def test_orakelet_er_deterministisk():
    seed = "å sende den skumle eposten"
    assert trefold.orakel(seed) == trefold.orakel(seed)


def test_ulike_frø_gir_ulik_spådom():
    a = trefold.orakel("flytte til en ny by")
    b = trefold.orakel("lære seg å male")
    assert a != b


def test_rolig_modus_skjuler_stemmene_men_beholder_syntesen():
    seed = "starte noe nytt"
    full = trefold.orakel(seed, vis_stemmer=True)
    rolig = trefold.orakel(seed, vis_stemmer=False)
    for voice in trefold.VOICES:
        assert voice.navn not in rolig
        assert voice.navn in full
    assert "SYNTESEN" in rolig


def test_tomt_frø_ber_pent_om_et_nytt():
    assert "frø" in trefold.orakel("   ")


def test_alle_tre_stemmene_taler():
    seed = "be om hjelp"
    output = trefold.orakel(seed, vis_stemmer=True)
    for voice in trefold.VOICES:
        assert voice.navn in output
