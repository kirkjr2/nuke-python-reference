const CONTENT_QUALITY = {
  Grade: {
    tier: "verified",
    label: "Nuke-tested · 22/22 arguments passed",
    hideDescription: true,
    overview: "Grade remaps an image's tonal range using black point, white point, lift, gain, multiply, offset, and gamma controls. It is commonly used for tonal matching, setting black/white points, and targeted color correction.",
    synopsisArguments: [
      "channels",
      "blackpoint",
      "whitepoint",
      "black",
      "white",
      "multiply",
      "add",
      "gamma",
      "mix",
      "reverse"
    ],
    argumentOverrides: {
      fringe: {
        description: "Softens the edge of the mask so the grade transitions more gradually at the mask boundary."
      }
    }
  },
  ModifyMetaData: {
    tier: "needs-research",
    label: "Special scripting control",
    overview: "ModifyMetaData adds, edits, or removes metadata passing through the node tree. Its metadata control is a list editor containing set/remove actions, keys, and values; it should not be treated like a normal scalar Python knob.",
    note: "The scanner currently cannot fully describe the metadata action-list API. Generic scalar examples are intentionally suppressed until a manually verified scripting example is available.",
    argumentOverrides: {
      metadata: {
        type: "List_Knob / script data",
        defaultValue: "—",
        examplesHtml: '<span class="source-note">Special control</span>',
        description: "Metadata action list. Each row specifies a set/remove action, metadata key, and optional value. Configure this control in the Properties panel or through Nuke script syntax rather than treating it as a float."
      }
    },
    suppressExamples: true
  },
  Blur: {
    tier: "verified",
    label: "Nuke-tested · 12/12 arguments passed",
    hideDescription: true,
    overview: "Blur softens an image by spreading pixel values horizontally and vertically. Use Size to control the blur radius, Filter to choose the falloff, Channels to limit which channels are affected, and Mix to blend the result with the input.",
    synopsisArguments: ["channels", "size", "filter", "mix", "crop"],
    argumentOverrides: {
      size: {
        description: "Horizontal and vertical blur size in pixels. Set one number for both axes or set each axis independently."
      },
      filter: {
        description: "Filter used to shape the blur: box, triangle, quadratic, or gaussian."
      },
      fringe: {
        description: "Softens the edge of the mask so the blur transitions more gradually at the mask boundary."
      },
      quality: {
        description: "Performance-quality threshold for very large blurs. Lower values render faster but may look less smooth."
      }
    }
  },
  Merge2: {
    tier: "verified",
    label: "Nuke-tested · 17/17 arguments passed",
    hideDescription: true,
    overview: "Merge combines foreground input A with background input B. In Python, input 0 is B and input 1 (or higher) is A. The Operation determines how their pixels and alpha interact; Over is the standard choice for placing a premultiplied foreground over a background.",
    synopsisArguments: ["operation", "Achannels", "Bchannels", "output", "mix", "bbox"],
    argumentOverrides: {
      operation: {
        description: "Compositing operation applied between A and B. Use over for a standard premultiplied foreground-over-background composite."
      },
      bbox: {
        description: "Chooses the output bounding box: the union or intersection of both inputs, or only A or B."
      },
      also_merge: {
        description: "Additional non-RGB channels to process with the selected merge operation."
      },
      fringe: {
        description: "Softens the edge of the mask so the merge transitions more gradually at the mask boundary."
      },
      metainput: {
        description: "Chooses whether output metadata comes from B, A, or both inputs. Duplicate keys from B take priority when using All."
      },
      rangeinput: {
        description: "Chooses whether the output frame range comes from B, A, or both inputs."
      }
    }
  },
  Transform: {
    tier: "verified",
    label: "Nuke-tested · 16/16 arguments passed",
    hideDescription: true,
    overview: "Transform repositions a 2D image with translation, rotation, scale, and skew around a chosen center point. It is commonly used to place elements, add simple animation, apply tracked motion, or introduce motion blur.",
    synopsisArguments: ["translate", "rotate", "scale", "center", "filter", "black_outside", "motionblur"],
    argumentOverrides: {
      translate: { description: "Horizontal and vertical movement in pixels." },
      rotate: { description: "Clockwise rotation in degrees around the Center point." },
      scale: { description: "Horizontal and vertical scale multiplier. A value of 1 preserves the original size." },
      center: { description: "Pivot point used for rotation, scaling, and skewing." },
      filter: { description: "Resampling filter used when pixels move or scale. Cubic is a practical general-purpose default." },
      black_outside: { description: "Fills pixels outside the transformed input bounds with black. Disable it when edge pixels need to extend beyond the source bounds." },
      matrix: {
        type: "Matrix4 / Transform2d_Knob",
        examplesHtml: '<span class="source-note">Advanced / derived</span>',
        description: "Derived 4×4 matrix behind the visible transform controls. The identity matrix produces no visual change, and direct component editing is rarely useful in normal compositing scripts. Prefer Translate, Rotate, Scale, Skew, and Center; use value() only when another tool needs the composed Matrix4."
      },
      motionblur: { description: "Controls the number of motion-blur samples. Zero disables motion blur; higher values improve smoothness at additional render cost." },
      shutter: { description: "Duration of the motion-blur exposure measured in frames." }
    }
  },
  Unpremult: {
    tier: "verified",
    label: "Nuke-tested · 3/3 arguments passed",
    hideDescription: true,
    overview: "Unpremult divides selected color channels by an alpha channel, recovering the unassociated RGB values beneath soft or partially transparent edges. Use it before color corrections on premultiplied elements, then add a Premult afterward to restore the RGB-alpha relationship.",
    synopsisArguments: ["channels", "alpha", "invert"],
    example: { title: "Restore premultiplication after a color correction", code: '# Build an Unpremult -> Grade -> Premult workflow.\nelement = nuke.createNode("ColorWheel")\nunpremult = nuke.createNode("Unpremult")\nunpremult.setInput(0, element)\ngrade = nuke.createNode("Grade")\ngrade.setInput(0, unpremult)\ngrade["multiply"].setValue(1.15)\n\n# Multiply corrected RGB by alpha again before an Over composite.\npremult = nuke.createNode("Premult")\npremult.setInput(0, grade)\npremult["channels"].setValue("rgb")\npremult["alpha"].setValue("alpha")' },
    argumentOverrides: {
      channels: { description: "Channels to divide by the selected alpha source. RGB is the standard choice for normal premultiplied imagery." },
      alpha: { description: "Channel used as the divisor. Alpha is the standard source for an RGBA element." },
      invert: { description: "Divides by one minus the selected alpha channel instead of the alpha itself." }
    }
  },
  Premult: {
    tier: "verified", label: "Nuke-tested · 3/3 arguments passed", hideDescription: true,
    overview: "Premult multiplies selected color channels by an alpha channel, restoring the RGB-alpha relationship required for a standard Over composite. Use it after operations performed on unpremultiplied RGB; avoid applying it again to imagery that is already premultiplied.",
    synopsisArguments: ["channels", "alpha", "invert"],
    argumentOverrides: {
      channels: { description: "Channels to multiply by the selected alpha source. RGB is the standard choice." },
      alpha: { description: "Channel used as the multiplier. Alpha is the standard source for RGBA imagery." },
      invert: { description: "Multiplies by one minus the selected alpha channel instead of alpha." }
    }
  },
  Saturation: {
    tier: "verified", label: "Nuke-tested · 12/12 arguments passed", hideDescription: true,
    overview: "Saturation changes color intensity without directly changing image luminance. A value of 0 produces grayscale, 1 preserves the input, and values above 1 increase color intensity.",
    synopsisArguments: ["channels", "saturation", "mode", "mix", "unpremult"],
    example: { title: "Create a controlled muted-color treatment", code: '# Create a source so the example runs in an empty script.\nsource = nuke.createNode("ColorWheel")\nsat = nuke.createNode("Saturation")\nsat.setInput(0, source)\nsat["channels"].setValue("rgb")\nsat["mode"].setValue("Rec 709")\n\n# Reduce color intensity while retaining some original color.\nsat["saturation"].setValue(0.35)\nsat["mix"].setValue(0.85)' },
    argumentOverrides: {
      saturation: { description: "Color-intensity multiplier: 0 is grayscale, 1 is unchanged, and values above 1 increase saturation." },
      mode: { description: "Luminance calculation used while adjusting saturation. Rec 709 is the normal modern default." },
      fringe: { description: "Softens the mask boundary so the saturation adjustment transitions more gradually." }
    }
  },
  Crop: {
    tier: "verified", label: "Nuke-tested · 7/7 arguments passed", hideDescription: true,
    overview: "Crop limits an image and its bounding box to a rectangular region. It can preserve the original coordinate system or move the cropped region to the origin and create a matching output format.",
    synopsisArguments: ["box", "crop", "reformat", "intersect", "softness"],
    example: { title: "Crop ten percent from every edge", code: '# Create a source and crop relative to its format.\nsource = nuke.createNode("CheckerBoard2")\nwidth = source.width()\nheight = source.height()\nmargin_x = width * 0.10\nmargin_y = height * 0.10\n\ncrop = nuke.createNode("Crop")\ncrop.setInput(0, source)\ncrop["box"].setValue([margin_x, margin_y, width - margin_x, height - margin_y])\n\n# Move the result to 0,0 and match the format to the crop.\ncrop["crop"].setValue(True)\ncrop["reformat"].setValue(True)' },
    argumentOverrides: {
      box: { description: "Crop rectangle in left, bottom, right, top pixel coordinates." },
      crop: { description: "Adds a black boundary so pixels outside the crop rectangle evaluate as black." },
      reformat: { description: "Moves the cropped region to 0,0 and changes the output format to the crop size." },
      reset: { type: "Script_Knob / button", examplesHtml: '<span class="source-note">UI action</span>', description: "Properties-panel button that resets the crop box; not a normal value argument." }
    }
  },
  Reformat: {
    tier: "verified", label: "Nuke-tested · 16/16 arguments passed", hideDescription: true,
    overview: "Reformat converts an image to a new resolution or pixel aspect ratio. Use Fit to preserve the entire image, Fill to cover the output while cropping excess, or Distort when independent width and height scaling is intentional.",
    synopsisArguments: ["type", "resize", "format", "box_width", "box_height", "filter", "center"],
    example: { title: "Fit an image into a 1280 × 720 delivery frame", code: '# Create a source and fit it inside a fixed HD delivery box.\nsource = nuke.createNode("CheckerBoard2")\nreformat = nuke.createNode("Reformat")\nreformat.setInput(0, source)\nreformat["type"].setValue("to box")\nreformat["box_width"].setValue(1280)\nreformat["box_height"].setValue(720)\nreformat["box_pixel_aspect"].setValue(1.0)\nreformat["box_fixed"].setValue(True)\nreformat["resize"].setValue("fit")\nreformat["center"].setValue(True)\nreformat["filter"].setValue("cubic")' },
    argumentOverrides: {
      format: { type: "Format / Format_Knob", examplesHtml: '<span class="source-note">nuke.Format</span>', description: "Output format object or registered project-format name when Type is set to to format." },
      resize: { description: "Scaling policy: none, width, height, fit, fill, or distort." },
      pbb: { description: "Preserves pixels outside the output format bounding box instead of clipping them." }
    }
  },
  Shuffle2: {
    tier: "needs-research", label: "Nuke-tested control · mapping serialization needs research", hideDescription: true,
    overview: "Shuffle rearranges channels between layers and supports mappings from two inputs. Its mapping UI is stored in a compound NoodleKnob rather than ordinary scalar arguments, so generic knob-setting examples are intentionally withheld until its script representation is verified.",
    synopsisArguments: [],
    argumentOverrides: {
      shuffle: { type: "NoodleKnob / channel mapping data", examplesHtml: '<span class="source-note">Special control</span>', description: "Verified as a visible NoodleKnob. Its default toScript() result is empty, so the editable channel-mapping serialization still needs a change-and-inspect test. Do not treat it as a float despite the scanner's current classification." }
    },
    suppressExamples: true
  },
  Dissolve: {
    tier: "verified", label: "Nuke-tested · 10/10 arguments passed", hideDescription: true,
    overview: "Dissolve switches or blends between multiple image inputs. Whole-number Which values select an input; fractional values blend between neighboring inputs, making it useful for transitions and version comparisons.",
    synopsisArguments: ["which", "channels", "mergerange", "metainput"],
    example: { title: "Animate a twelve-frame transition between two images", code: '# Create two sources and dissolve between them.\nfirst = nuke.createNode("CheckerBoard2")\nsecond = nuke.createNode("ColorWheel")\ndissolve = nuke.createNode("Dissolve")\ndissolve.setInput(0, first)\ndissolve.setInput(1, second)\nstart = int(nuke.root()["first_frame"].value())\ndissolve["which"].setAnimated()\ndissolve["which"].setValueAt(0.0, start)\ndissolve["which"].setValueAt(1.0, start + 12)' },
    argumentOverrides: { which: { description: "Selects an input at whole numbers and blends between adjacent inputs at fractional values." }, metainput: { description: "Chooses which input supplies output metadata." } }
  },
  Switch: {
    tier: "verified", label: "Nuke-tested · 1/1 argument passed", hideDescription: true,
    overview: "Switch outputs one of its connected inputs. Animate Which to change sources over time, or drive it with an expression to select versions, quality levels, or fallback branches.",
    synopsisArguments: ["which"],
    example: { title: "Switch from a temporary plate to a final plate", code: '# Build two stand-in sources and switch at frame 101.\ntemporary = nuke.createNode("CheckerBoard2")\nfinal = nuke.createNode("ColorWheel")\nswitch = nuke.createNode("Switch")\nswitch.setInput(0, temporary)\nswitch.setInput(1, final)\nswitch["which"].setExpression("frame < 101 ? 0 : 1")' },
    argumentOverrides: { which: { description: "Zero-based index of the input to output. It may be animated or expression-driven." } }
  },
  Keymix: {
    tier: "verified", label: "Nuke-tested · 5/5 arguments passed", hideDescription: true,
    overview: "Keymix copies selected channels from A into B through a mask. It is useful for localized replacements where the mask should control exactly where foreground channels replace the background.",
    synopsisArguments: ["channels", "maskChannel", "invertMask", "mix", "bbox"],
    example: { title: "Replace part of a background through a matte", code: '# Generate A, B, and mask inputs for a self-contained Keymix.\nbackground = nuke.createNode("CheckerBoard2")\nreplacement = nuke.createNode("ColorWheel")\nmatte = nuke.createNode("Radial")\nkeymix = nuke.createNode("Keymix")\nkeymix.setInput(0, replacement)  # A\nkeymix.setInput(1, background)   # B\nkeymix.setInput(2, matte)        # mask\nkeymix["channels"].setValue("rgba")\nkeymix["maskChannel"].setValue("alpha")\nkeymix["mix"].setValue(1.0)' },
    argumentOverrides: { bbox: { description: "Chooses the output bounding box from the union, B side, or A side." } }
  },
  Remove: {
    tier: "verified", label: "Nuke-tested · 5/5 arguments passed", hideDescription: true,
    overview: "Remove deletes selected channels or keeps only selected channels. It is commonly used to strip unused render passes and keep scripts lighter and easier to inspect.",
    synopsisArguments: ["operation", "channels", "channels2", "channels3", "channels4"],
    example: { title: "Keep only RGBA before continuing the composite", code: '# Create a source and discard every channel except RGBA.\nsource = nuke.createNode("ColorWheel")\nremove = nuke.createNode("Remove")\nremove.setInput(0, source)\nremove["operation"].setValue("keep")\nremove["channels"].setValue("rgba")' }
  },
  Copy: {
    tier: "verified", label: "Nuke-tested · 21/21 arguments passed", hideDescription: true,
    overview: "Copy transfers channels from input A into input B while leaving the other B channels unchanged. A common use is copying a newly created matte into the alpha channel of an RGB element.",
    synopsisArguments: ["from0", "to0", "channels", "mix", "bbox"],
    example: { title: "Copy a generated matte into an element's alpha", code: '# Generate an RGB element and a separate matte.\nelement = nuke.createNode("ColorWheel")\nmatte = nuke.createNode("Radial")\ncopy = nuke.createNode("Copy")\ncopy.setInput(0, matte)    # A: channel source\ncopy.setInput(1, element)  # B: image to preserve\ncopy["from0"].setValue("alpha")\ncopy["to0"].setValue("alpha")\ncopy["mix"].setValue(1.0)' },
    argumentOverrides: { from0: { description: "Source channel read from input A." }, to0: { description: "Destination channel written into the output based on input B." } }
  },
  Gamma: {
    tier: "verified", label: "Nuke-tested · 11/11 arguments passed", hideDescription: true,
    overview: "Gamma reshapes midtones while leaving zero and one anchored. Values above 1 brighten midtones and values below 1 darken them.",
    synopsisArguments: ["value", "channels", "mix", "unpremult"],
    example: { title: "Lift dark midtones without moving black or white", code: '# Create a source and apply a subtle RGB gamma adjustment.\nsource = nuke.createNode("ColorWheel")\ngamma = nuke.createNode("Gamma")\ngamma.setInput(0, source)\ngamma["channels"].setValue("rgb")\ngamma["value"].setValue(1.15)\ngamma["mix"].setValue(0.8)' },
    argumentOverrides: { value: { description: "Per-channel gamma control. Values above 1 brighten midtones; values below 1 darken them." } }
  },
  Invert: {
    tier: "verified", label: "Nuke-tested · 11/11 arguments passed", hideDescription: true,
    overview: "Invert subtracts selected channels from one. It is commonly used to reverse mattes or create a photographic negative of RGB channels.",
    synopsisArguments: ["channels", "clamp", "mix"],
    example: { title: "Invert an alpha matte while preserving RGB", code: '# Create an alpha-bearing source and invert only its matte.\nsource = nuke.createNode("Radial")\ninvert = nuke.createNode("Invert")\ninvert.setInput(0, source)\ninvert["channels"].setValue("alpha")\ninvert["clamp"].setValue(True)\ninvert["mix"].setValue(1.0)' }
  },
  Clamp: {
    tier: "verified", label: "Nuke-tested · 18/18 arguments passed", hideDescription: true,
    overview: "Clamp limits channel values to a chosen range. It is useful for constraining mattes to 0–1 or preventing negative and super-white values before operations that require bounded data.",
    synopsisArguments: ["channels", "minimum", "maximum", "minimum_enable", "maximum_enable", "mix"],
    example: { title: "Constrain a matte to the legal 0–1 range", code: '# Create a matte source and clamp only alpha.\nsource = nuke.createNode("Radial")\nclamp = nuke.createNode("Clamp")\nclamp.setInput(0, source)\nclamp["channels"].setValue("alpha")\nclamp["minimum_enable"].setValue(True)\nclamp["minimum"].setValue(0.0)\nclamp["maximum_enable"].setValue(True)\nclamp["maximum"].setValue(1.0)' }
  },
  Colorspace: {
    tier: "verified", label: "Nuke-tested · 17 writable arguments passed · 2 special controls inspected", hideDescription: true,
    overview: "Colorspace converts image values between legacy color spaces, primaries, and illuminants. In modern OCIO-managed projects, prefer OCIOColorSpace unless this legacy node is specifically required.",
    synopsisArguments: ["colorspace_in", "colorspace_out", "channels", "mix"],
    example: { title: "Convert legacy sRGB-encoded values to linear", code: '# Convert an sRGB-encoded source into linear values.\nsource = nuke.createNode("ColorWheel")\nconvert = nuke.createNode("Colorspace")\nconvert.setInput(0, source)\nconvert["channels"].setValue("rgb")\nconvert["colorspace_in"].setValue("sRGB")\nconvert["colorspace_out"].setValue("RGB")' },
    argumentOverrides: {
      colormatrix: { type: "IArray_Knob / derived matrix", examplesHtml: '<span class="source-note">Advanced / derived</span>', description: "Read-only-style matrix output from some transforms; not a normal integer or list argument to replay from scanner data." },
      swap: { type: "Script_Knob / button", examplesHtml: '<span class="source-note">UI action</span>', description: "Swaps input and output settings in the Properties panel." }
    }
  },
  Log2Lin: {
    tier: "verified", label: "Nuke-tested · 15/15 arguments passed", hideDescription: true,
    overview: "Log2Lin converts between legacy Cineon log values and linear light using configurable black, white, and film-gamma points. Use it for Cineon-style material when an OCIO transform is not the appropriate pipeline conversion.",
    synopsisArguments: ["operation", "channels", "black", "white", "gamma", "mix"],
    example: { title: "Convert Cineon log values to linear light", code: '# Create a source and apply the standard Cineon-style conversion.\nsource = nuke.createNode("ColorWheel")\nconvert = nuke.createNode("Log2Lin")\nconvert.setInput(0, source)\nconvert["operation"].setValue("log2lin")\nconvert["channels"].setValue("rgb")\nconvert["black"].setValue(95.0)\nconvert["white"].setValue(685.0)\nconvert["gamma"].setValue(0.6)' }
  }
};

function contentQualityCurrentNode() {
  return new URL(window.location.href).searchParams.get("node");
}

function applyContentQuality() {
  const page = document.querySelector("#page");
  if (!page) return;

    const nodeClass = contentQualityCurrentNode();
    const entry = CONTENT_QUALITY[nodeClass];

    page.querySelectorAll(".editorial-quality, .editorial-overview, .editorial-note").forEach(el => el.remove());
    if (!entry || !page.querySelector("h1")) return;

    const classLine = page.querySelector(".class-line");
    if (classLine) {
      const status = document.createElement("div");
      status.className = `editorial-quality editorial-quality-${entry.tier}`;
      status.textContent = entry.label;
      classLine.insertAdjacentElement("afterend", status);
    }

    const description = page.querySelector(".description");
    if (description && entry.hideDescription) {
      description.remove();
    }
    if (description && entry.description) {
      description.textContent = entry.description;
    }
    if (description && entry.overview) {
      const overview = document.createElement("section");
      overview.className = "editorial-overview";
      overview.innerHTML = `<div class="editorial-overview-title">Overview</div><div>${entry.overview}</div>`;
      (description.isConnected ? description : classLine)?.insertAdjacentElement("afterend", overview);

      if (entry.note) {
        const note = document.createElement("div");
        note.className = "editorial-note";
        note.textContent = entry.note;
        overview.insertAdjacentElement("afterend", note);
      }
    }

    for (const [argName, override] of Object.entries(entry.argumentOverrides || {})) {
      const row = document.querySelector(`#arg-${CSS.escape(argName)}`);
      if (!row) continue;

      if (override.type) {
        const el = row.querySelector(".arg-type");
        if (el) el.textContent = override.type;
      }
      if (override.defaultValue !== undefined) {
        const el = row.querySelector(".arg-default");
        if (el) el.textContent = override.defaultValue;
      }
      if (override.examplesHtml) {
        const el = row.querySelector(".arg-examples");
        if (el) el.innerHTML = override.examplesHtml;
      }
      if (override.description) {
        const el = row.querySelector(".arg-desc");
        if (el) el.textContent = override.description;
      }
    }

    if (entry.example) {
      const examples = page.querySelector(".examples");
      if (examples) examples.innerHTML = `<div class="example-item"><div class="example-title">${escapeHtml(entry.example.title)}</div><pre class="code">${highlightPython(entry.example.code)}</pre></div>`;
    }

    if (entry.suppressExamples) {
      const examples = page.querySelector(".examples");
      if (examples) {
        examples.innerHTML = '<div class="no-examples">No manually verified Python example is published for this special control yet.</div>';
      }
    }

    const examples = page.querySelector(".examples");
    const examplesHeading = examples?.closest(".section")?.querySelector("h2");
    const exampleCount = examples?.querySelectorAll(".example-item").length || 0;
    if (examplesHeading) examplesHeading.textContent = exampleCount === 1 ? "Example" : "Examples";
}

function contentQualitySynopsisArguments(nodeClass, argumentOrder) {
  return CONTENT_QUALITY[nodeClass]?.synopsisArguments || argumentOrder;
}

function contentQualityExample(nodeClass) {
  const example = CONTENT_QUALITY[nodeClass]?.example;
  return example ? {title: example.title, code: example.code} : null;
}

function contentQualitySuppressExamples(nodeClass) {
  return Boolean(CONTENT_QUALITY[nodeClass]?.suppressExamples);
}
