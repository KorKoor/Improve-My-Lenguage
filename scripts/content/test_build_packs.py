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


class Conjugation(unittest.TestCase):
    def test_table_from_tagged_forms(self):
        forms = [
            {"form": "ai", "tags": ["first-person", "indicative", "present", "singular"]},
            {"form": "as", "tags": ["indicative", "present", "second-person", "singular"]},
            {"form": "a", "tags": ["indicative", "present", "singular", "third-person"]},
            {"form": "avons", "tags": ["first-person", "indicative", "plural", "present"]},
            {"form": "avez", "tags": ["indicative", "plural", "present", "second-person"]},
            {"form": "ont", "tags": ["indicative", "plural", "present", "third-person"]},
            {"form": "aie", "tags": ["first-person", "present", "singular", "subjunctive"]},
            {"form": "present indicative of avoir + past participle", "tags": ["indicative", "multiword-construction", "perfect", "present"]},
            {"form": "ayant", "tags": ["gerund", "participle", "present"]},
        ]
        t = bp.conjugation_table(forms, "fr")
        self.assertEqual(t["ind.pres"], ["ai", "as", "a", "avons", "avez", "ont"])
        self.assertNotIn("subj.pres", t)  # una sola persona no basta para una fila

    def test_shared_plural_and_marks(self):
        forms = [
            {"form": "ben", "tags": ["first-person", "present", "singular"]},
            {"form": "bent", "tags": ["present", "second-person", "singular"]},
            {"form": "is", "tags": ["present", "singular", "third-person"]},
            {"form": "zijn", "tags": ["plural", "present"]},
        ]
        self.assertEqual(bp.conjugation_table(forms, "nl")["ind.pres"], ["ben", "bent", "is", "zijn", "zijn", "zijn"])
        self.assertEqual(bp.display_form("ru", "де́лай"), "делай")
        self.assertEqual(bp.display_form("it", "sóno"), "sono")
        self.assertEqual(bp.display_form("it", "sarò"), "sarò")


class Singulars(unittest.TestCase):
    def test_plural_candidates(self):
        self.assertIn("city", bp.singulars("cities"))
        self.assertIn("box", bp.singulars("boxes"))
        self.assertIn("dog", bp.singulars("dogs"))
        self.assertEqual(bp.singulars("glass"), ["glass"])


if __name__ == "__main__":
    unittest.main()
