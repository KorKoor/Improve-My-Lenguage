"""Pruebas de las funciones puras del pipeline de contenido.

    python -m unittest scripts/content/test_build_packs.py
"""
import importlib.util
import sys
import unittest
from pathlib import Path

_spec = importlib.util.spec_from_file_location("build_packs", Path(__file__).with_name("build_packs.py"))
bp = importlib.util.module_from_spec(_spec)
sys.modules["build_packs"] = bp
_spec.loader.exec_module(bp)


class TidyTranslation(unittest.TestCase):
    def test_wiktionary_annotations(self):
        cases = {
            "pertenecer [with en or a]": "pertenecer a",
            "[el] ala": "ala",
            "mermar[se]": "mermar",
            "sin precedente[s]": "sin precedentes",
            "jugar / juguetear [con]": "jugar con",
            "[a] tiempo completo": "a tiempo completo",
            "arrepentirse [de]": "arrepentirse de",
            "lucrarse [with de or con]": "lucrarse con",
            "y/o": "y/o",
            "casa": "casa",
            "someterse ]": "someterse",
            "doce docenas =": "doce docenas",
        }
        for raw, expected in cases.items():
            with self.subTest(raw=raw):
                self.assertEqual(bp.clean_candidate(raw), expected)

    def test_numbers_and_length(self):
        self.assertEqual(bp.clean_candidate("perro2"), "perro")
        self.assertEqual(bp.clean_candidate("x" * 80), "")


class GlossFormOf(unittest.TestCase):
    def test_inflection_glosses(self):
        self.assertEqual(bp.gloss_form_of("Dative plural of der"), "der")
        self.assertEqual(bp.gloss_form_of("Alternative form of colour"), "colour")

    def test_rejects_descriptions(self):
        # «The ordinal form of the number six» no es una forma flexionada de «the».
        self.assertIsNone(bp.gloss_form_of("The ordinal form of the number six."))
        self.assertIsNone(bp.gloss_form_of("A diminutive of the female given names Eleanor, Ellen, and Helen"))


class Singulars(unittest.TestCase):
    def test_plural_candidates(self):
        self.assertIn("city", bp.singulars("cities"))
        self.assertIn("box", bp.singulars("boxes"))
        self.assertIn("dog", bp.singulars("dogs"))
        self.assertEqual(bp.singulars("glass"), ["glass"])


if __name__ == "__main__":
    unittest.main()
