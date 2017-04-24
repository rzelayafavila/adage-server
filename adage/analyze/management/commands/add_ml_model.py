#!/usr/bin/env python

"""
This management command adds a new machine learning model record whose
name is ml_model_name into the database's ml_model table.  It should be
invoked like this:

  python manage.py add_ml_model <ml_model_name> <organism_tax_id> \
 [--directed_edge]

The two required arguments are:
  (1) ml_model_name: machine learning model name;
  (2) organism_tax_id: taxonomy ID of the organism of ml_model_name.

"--directed_edge" is an optional argument.  If it is specified, the
edges in the gene-gene relationship table will be directed; otherwise
the edges in the gene-gene relationship table will be undirected.

IMPORTANT:
Before running this command, please make sure that organism_tax_id
already exists in the database's "Organism" table, whose model is
bundled in "django-organisms" package.  If organism_tax_id is not in the
database yet, you can use "organisms_create_or_update.py" management
command in that package to add it.
"""

from __future__ import print_function
from django.core.management.base import BaseCommand, CommandError
from organisms.models import Organism
from analyze.models import MLModel


class Command(BaseCommand):
    help = "Add a new machine learning model to the database."

    def add_arguments(self, parser):
        parser.add_argument('ml_model_name', type=str)
        parser.add_argument('organism_tax_id', type=int)
        parser.add_argument('--directed_edge',
                            action='store_true',
                            dest='directed',
                            default=False,
                            help='Create directed gene-gene relationship '
                            'edges')

    def handle(self, **options):
        try:
            add_ml_model(options['ml_model_name'],
                         options['organism_tax_id'],
                         options['directed'])
            self.stdout.write(self.style.NOTICE(
                "Added a new machine learning model successfully"))
        except Exception as e:
            raise CommandError(
                "Failed to add a new machine learning model: add_ml_model "
                "raised an exception:\n%s" % e)


def add_ml_model(ml_model_name, organism_tax_id, directed_edge):
    # Raise an exception if ml_model_name on the command line is "" or
    # "  ".
    if not ml_model_name or ml_model_name.isspace():
        raise Exception("Input ml_model_name is blank")

    # Raise an exception if organism_tax_id does not exist in Organism
    # table.
    try:
        organism = Organism.objects.get(taxonomy_id=organism_tax_id)
    except Organism.DoesNotExist:
        raise Exception("Input organism_tax_id is not found in the database. "
                        "Please use the management command "
                        "'organism_create_or_update.py' in django-organisms "
                        "package to create this organism.")

    MLModel.objects.create(title=ml_model_name,
                           organism=organism,
                           directed_g2g_edge=directed_edge)
